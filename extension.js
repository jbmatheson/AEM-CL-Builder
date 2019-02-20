const vscode = require('vscode');
const fs = require('fs-extra');
const chokidar = require('chokidar');

const lib = '/clientlibs/';
let _extensions = {
    JS: 'js',
    CSS: 'css',
    LESS: 'less',
    TXT: 'txt',
    XML: 'xml'
}
let specChars = {
    fSlash: '/',
    period: '.'
}
let _paths = {
    Apps: '/jcr_root/apps',
    Comps: '/components/content/',
    jsSrcFolder: lib + _extensions.JS + specChars.fSlash,
    jsSrcIncTxt: lib + _extensions.JS + specChars.period + _extensions.TXT,
    cssSrcFolder: lib + _extensions.CSS + specChars.fSlash,
    cssSrcIncTxt: lib + _extensions.CSS + specChars.period + _extensions.TXT,
    lessSrcFolder: lib + _extensions.LESS + specChars.fSlash
}
let _prompts = {
    success: ' Clientlib structure was built for the ',
    failure: 'This is not a valid component folder.',
    exists: 'This clientlib\'s structure already exists.',
    component: ' component'
}
let _textBase = {
    JS: '#base=' + _extensions.JS + '\r\n',
    CSS: '#base=' + _extensions.CSS + '\r\n',
    LESS: '#base=' + _extensions.LESS + '\r\n'
}

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.buildJSClientlibs', (fileUri) => {
            let componentName = fileUri.path.split(specChars.fSlash).pop();

            if(fs.existsSync(fileUri.path + _paths.jsSrcFolder)){
                vscode.window.showInformationMessage(_prompts.exists);
            }
            else if(fileUri.path.includes(_paths.Apps)
                && fileUri.path.includes(_paths.Comps + componentName)){
                    copyBase(fileUri,context,_extensions.JS);
                    copyCompFile(fileUri,_paths.jsSrcIncTxt,componentName,_textBase.JS,_extensions.JS);

                    vscode.window.showInformationMessage(_extensions.JS.toUpperCase() + _prompts.success + componentName + _prompts.component + specChars.period);
            } else{
                vscode.window.showInformationMessage(_prompts.failure);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.buildCSSClientlibs', (fileUri) => {
            let componentName = fileUri.path.split(specChars.fSlash).pop();

            if(fs.existsSync(fileUri.path + _paths.cssSrcFolder)){
                vscode.window.showInformationMessage(_prompts.exists);
            }
            else if(fileUri.path.includes(_paths.Apps)
                && fileUri.path.includes(_paths.Comps + componentName)){
                    copyBase(fileUri,context,_extensions.CSS);
                    copyCompFile(fileUri,_paths.cssSrcIncTxt,componentName,_textBase.CSS,_extensions.CSS);

                    vscode.debug.activeDebugConsole.appendLine(_extensions.CSS.toUpperCase() + _prompts.success + componentName + _prompts.component + specChars.period);
                    vscode.window.showInformationMessage(_extensions.CSS.toUpperCase() + _prompts.success + componentName + _prompts.component + specChars.period);
            } else{
                vscode.window.showInformationMessage(_prompts.failure);
                vscode.debug.activeDebugConsole.appendLine(_prompts.failure);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.buildLESSClientlibs', (fileUri) => {
            let componentName = fileUri.path.split(specChars.fSlash).pop();

            if(fs.existsSync(fileUri.path + _paths.lessSrcFolder)){
                vscode.window.showInformationMessage(_prompts.exists);
            }
            else if(fileUri.path.includes(_paths.Apps)
                && fileUri.path.includes(_paths.Comps + componentName)){
                    copyBase(fileUri,context,_extensions.LESS);
                    copyCompFile(fileUri,_paths.cssSrcIncTxt,componentName,_textBase.LESS,_extensions.LESS);

                    vscode.window.showInformationMessage(_extensions.LESS.toUpperCase() + _prompts.success + componentName + _prompts.component + specChars.period);
            } else{
                vscode.window.showInformationMessage(_prompts.failure);
            }
        })
    );
}

function copyBase(fileUri, context, root){
    let path = context.extensionPath;
    let pathToContentXML = path + lib + '.content.' + _extensions.XML;
    let pathToClientlibs =  path + lib + root + specChars.fSlash;
    let pathToNewClientLibs = fileUri.path + lib + root + specChars.fSlash;

    fs.copy(pathToClientlibs, pathToNewClientLibs)
    .then(() => fs.copy(pathToContentXML, fileUri.path + lib + '.content.xml'))
    .catch(err => vscode.debug.activeDebugConsole.appendLine(err))

    if(root !== _extensions.LESS){
        fs.copy(context.extensionPath +
            lib + root + specChars.period + _extensions.TXT,
            fileUri.path + lib + root + specChars.period + _extensions.TXT)
            .catch(err => vscode.debug.activeDebugConsole.appendLine(err));;
    }
};

function copyCompFile(fileUri,srcTxtFile,componentName,txtBase,type){
    var pathToCL = fileUri.path + lib;
    var watcher = chokidar.watch(pathToCL, {
        ignored: /(^|[\/\\])\../,
        persistent: true
    });

    watcher
    .on('add', function(path) {
        let nPath = path.replace(/\/[^\/]+\/?$/, '');
        let f = nPath + "/" + type + "/" + componentName + specChars.period + type;
        let delFile = nPath + "/" + type + "/" + type + specChars.period + _extensions.TXT;

        fs.writeFile(f,'')
            .catch(err => vscode.debug.activeDebugConsole.appendLine(err));
        fs.unlink(delFile);

        let pathToTxtFile = fileUri.path + srcTxtFile;
        let f2 = txtBase + componentName + specChars.period + type;

        fs.writeFile(pathToTxtFile, f2)
            .catch(err => vscode.debug.activeDebugConsole.appendLine(err));

        watcher.close();
    });
};

exports.activate = activate;
