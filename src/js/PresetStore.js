/**
 * Handles loading/saving of presets to disk. Can only be used server-side.
 */
import * as path from "path";
import { mkdir, readFile, rm, stat, writeFile } from "fs/promises";
import glob from "glob-promise";
import { PreviewStore } from "./led/PreviewStore.js";
import { Animation } from "./led/Animation.js";
/***
 * Get mtime of filename, returns 0 if it doesnt exist.
 * @param fileName
 */
export async function getMtime(fileName) {
    try {
        const s = await stat(fileName);
        return (s.mtimeMs);
    }
    catch (e) {
        return (0);
    }
}
export async function createParentDir(fileName) {
    try {
        await mkdir(path.dirname(fileName));
    }
    catch (e) {
        //exists
    }
}
export class PresetStore {
    constructor(animationPath = "src/js/led/animations", presetPath = "presets") {
        this.presetPath = presetPath;
        this.animationPath = animationPath;
    }
    //scan animation dir and return list of all javascript names (short form without path and extension)
    async scanAnimationDir() {
        let ret = [];
        const pattern = path.join(this.animationPath, "*.js");
        for (const file of await glob(pattern)) {
            ret.push(path.basename(file, ".js"));
        }
        return (ret);
    }
    //dynamicly loads an animation class from disk and returns the Class
    async loadAnimation(animationName) {
        //hack: this path is relative to the current file instead of current working dir.
        let filename = "./led/animations/" + animationName + ".js";
        console.log("loading", filename);
        let module = await import(filename);
        if (!(module.default.prototype instanceof Animation))
            throw ("Not a valid Animation");
        return module.default;
    }
    /**
     * Get all presetnames for specified animation
     */
    async scanPresetNames(presetDir) {
        const pattern = path.join(this.presetPath, presetDir, "*.json");
        let names = [];
        for (const file of await glob(pattern)) {
            names.push(path.basename(file, ".json"));
        }
        return names;
    }
    /**
     * Return preset in PresetValues format.
     * @param presetDir
     * @param presetName
     */
    async load(presetDir, presetName) {
        return JSON.parse(await readFile(this.presetFilename(presetDir, presetName), 'utf8'));
    }
    /**
     * Save preset to disk
     * @param presetDir
     * @param presetName
     * @param preset
     */
    async save(presetDir, presetName, preset) {
        const presetFileName = this.presetFilename(presetDir, presetName);
        await createParentDir(presetFileName);
        await writeFile(presetFileName, JSON.stringify(preset, undefined, ' '), 'utf8');
        this.updateAnimationPresetList();
    }
    /**
     * Render preview of a preset and save it to disk (usually called after save())
     */
    async createPreview(animationName, presetName, preset) {
        let previewStore = new PreviewStore();
        const animationClass = await this.loadAnimation(animationName);
        const previewFilename = this.previewFilename(animationClass.presetDir, presetName);
        await createParentDir(previewFilename);
        return (previewStore.render(previewFilename, animationClass, preset));
    }
    /**
     * Update all previews for all presets that need it. (either presetfile-mtime or animationfile-mtime is newer)
     * @param animationName
     * @param animationClass
     * @param animationMtime
     * @param force
     */
    async updatePresetPreviews(animationName, animationClass, animationMtime, force) {
        const presetNames = await this.scanPresetNames(animationClass.presetDir);
        for (const presetName of presetNames) {
            const previewFilename = this.previewFilename(animationClass.presetDir, presetName);
            const presetFilename = this.presetFilename(animationClass.presetDir, presetName);
            const previewMtime = await getMtime(previewFilename);
            if (force || animationMtime == 0 || previewMtime < animationMtime || previewMtime < await getMtime(presetFilename)) {
                const preset = await this.load(animationClass.presetDir, presetName);
                try {
                    await this.createPreview(animationName, presetName, preset);
                }
                catch (e) {
                    console.error("Error while rendering preset preview: ", e);
                }
            }
        }
    }
    /**
     * Update all previews for all animation/preset combinations that need it, according to mtime
     */
    async updateAnimationPreviews(force) {
        console.log("Rendering previews...");
        for (let animationName of await this.scanAnimationDir()) {
            try {
                let animationClass = await this.loadAnimation(animationName);
                const previewFilename = this.previewFilename(animationClass.presetDir, "");
                const animationFilename = path.join(__dirname, "js", "led", "animations", animationName + ".ts");
                const animationMtime = await getMtime(animationFilename);
                if (animationMtime == 0)
                    console.warn("Cant find " + animationFilename + ", always re-creating all previews. (check if filename matches classname)");
                if (force || animationMtime == 0 || await getMtime(previewFilename) <= animationMtime) {
                    try {
                        await this.createPreview(animationName, "", undefined);
                    }
                    catch (e) {
                        console.error("Error while rendering animation preview: ", e);
                    }
                }
                await this.updatePresetPreviews(animationName, animationClass, animationMtime, force);
            }
            catch (e) {
                console.log(`Ignored ${animationName}: ${e}`);
            }
        }
        console.log("Preview rendering complete");
    }
    async delete(presetDir, presetName) {
        await rm(this.presetFilename(presetDir, presetName));
        await rm(this.previewFilename(presetDir, presetName));
        await this.updateAnimationPresetList();
    }
    // async getCategories() {
    //     let cat = new Set();
    //     for (const [animationName, animation] of Object.entries(animations)) {
    //
    //         cat.add(animation.category)
    //     }
    //
    //     return ([...cat]);
    // }
    // Gets stripped list of all presets for animation, and adds previewUrl
    async scanPresetList(animationClass, animationName) {
        let ret = [];
        const presetNames = await this.scanPresetNames(animationClass.presetDir);
        for (const presetName of presetNames) {
            const preset = await this.load(animationClass.presetDir, presetName);
            const previewFilename = this.previewFilename(animationClass.presetDir, presetName);
            let strippedPreset = {
                title: preset.title,
                description: preset.description,
                name: presetName,
                previewFile: previewFilename + "?" + await getMtime(previewFilename)
            };
            // console.log(strippedPreset)
            ret.push(strippedPreset);
        }
        return (ret);
    }
    // scans and loads all animations and returns the grand preset list
    async scanAnimationPresetList() {
        let ret = [];
        for (const animationName of await this.scanAnimationDir()) {
            try {
                let animationClass = await this.loadAnimation(animationName);
                const previewFilename = this.previewFilename(animationClass.presetDir, "");
                let presets = await this.scanPresetList(animationClass, animationName);
                ret.push({
                    name: animationName,
                    title: animationClass.title,
                    description: animationClass.description,
                    presets: presets,
                    //add preview url, browsercache aware
                    previewFile: previewFilename + '?' + await getMtime(previewFilename)
                });
            }
            catch (e) {
                console.log(`Ignored ${animationName}: ${e}`);
            }
        }
        return (ret);
    }
    //load animation preset list from disk (cached)
    async loadAnimationPresetList() {
        return JSON.parse(await readFile(path.join(this.presetPath, 'index.json'), 'utf8'));
    }
    //update stored animation preset list
    async updateAnimationPresetList() {
        console.log("Updating animation preset list...");
        await writeFile(path.join(this.presetPath, 'index.json'), JSON.stringify(await this.scanAnimationPresetList(), undefined, ' '), 'utf8');
        console.log("done");
    }
    //FIXME: make secure
    presetFilename(presetDir, presetName) {
        return (path.join(this.presetPath, presetDir, presetName + ".json"));
    }
    //FIXME: make secure
    previewFilename(presetDir, presetName) {
        return (path.join(this.presetPath, presetDir, presetName + "_.png"));
    }
}
//# sourceMappingURL=PresetStore.js.map