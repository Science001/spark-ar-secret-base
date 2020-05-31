const Scene = require('Scene');
const Textures = require('Textures');
const Diagnostics = require('Diagnostics');

export default function getElements(elementNames, textureNames=[]) {
    return new Promise((resolve, reject) => {
        let elementsObject = {};
        Promise.all(elementNames.map(name => (Scene.root.findFirst(name))))
        .then(elementsArray => {
            elementNames.forEach((name, i) => {
                elementsObject[name] = elementsArray[i];
            })
            if(textureNames.length > 0) {
                elementsObject.texture = {}
                Promise.all(textureNames.map(name => (Textures.findFirst(name))))
                .then(texturesArray => {
                    textureNames.forEach((name, i) => {
                        elementsObject['texture'][name] = texturesArray[i];
                    })
                    resolve(elementsObject);
                })
                .catch((err) => {
                    Diagnostics.log("Error finding the textures");
                    reject(err);
                });
            }
            else resolve(elementsObject);
        })
        .catch((err) => {
            Diagnostics.log("Error finding the elements");
            reject(err);
        });
    });
}