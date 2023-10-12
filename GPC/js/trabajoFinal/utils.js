

export {visualizeSceneGraph, findObjectByNameRecursive, object3DToXML};

function visualizeSceneGraph(object, depth = 0) {
    // Genera un prefijo para la indentación con base en la profundidad
    const indent = ' '.repeat(depth * 4);

    // Imprime el nombre del objeto y su tipo en la consola
    console.log(indent + object.name + ' (' + object.type + ')');

    // Recorre los hijos del objeto
    for (const child of object.children) {
        // Llama a la función de manera recursiva para los hijos
        visualizeSceneGraph(child, depth + 1);
    }
}
function object3DToXML(obj3D, indent = 0) {
    const tab = '  '.repeat(indent);
    const name = obj3D.name || 'unnamed';

    let xml = `${tab}<Object3D name="${name}">\n`;

    obj3D.children.forEach((child) => {
        xml += object3DToXML(child, indent + 1);
    });

    xml += `${tab}</Object3D>\n`;

    return xml;
}
function findObjectByNameRecursive(parent, name) {
    // console.log(parent.name);
    if (parent.name === name) {
        
        return parent;
    } else {
        // console.log(" Parent name open: ",parent.name);
        for (var i = 0, l = parent.children.length; i < l; i++) {
            var child = parent.children[i];
            var result = findObjectByNameRecursive(child, name);
            if (result) {
                return result;
            }
        }
        // console.log(" Parent name close: ",parent.name);
    }
    return null; // No se encontró el objeto con el nombre especificado
}

