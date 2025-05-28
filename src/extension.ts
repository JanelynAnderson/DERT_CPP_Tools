import { writeFile } from 'fs';
import * as vscode from 'vscode';

function isValidFilenameNameOnly(name: string): boolean {
  // Disallow empty string
  if (!name.trim()) {return false;};

  // Disallow invalid characters
  const invalidChars = /[<>:"/\ \|?*\x00-\x1F]/g;
  if (invalidChars.test(name)) {return false;};

  // Disallow names ending with dot or space (Windows)
  if (/[. ]$/.test(name)) {return false;};

  // Disallow reserved Windows names
  const reserved = [
    "CON", "PRN", "AUX", "NUL",
    "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
    "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"
  ];
  if (reserved.includes(name.toUpperCase())) {return false;};

  return true;
}


export function activate(context: vscode.ExtensionContext) {

    let componentCommand = vscode.commands.registerCommand('dertcpptools.createcomponent', async () => {
		const ClassName = await vscode.window.showInputBox({
			prompt: 'Enter the class name',
		});
		// IS CLASS NAME EMPTY
		if(!ClassName)
		{
			vscode.window.showErrorMessage("Class name is required.");
			return;
		}
		// IS CLASS NAME A VALID NAME
		if(!isValidFilenameNameOnly(ClassName))
		{
			vscode.window.showErrorMessage("Class name is not a valid file name.");
			return false;
		}

		const workspaceFolders = vscode.workspace.workspaceFolders;
		// IS USER IN A WORKSPACE
		if(!workspaceFolders)
		{
			vscode.window.showErrorMessage('No Workspace is open.');
			return;
		}
		const workspaceUri = workspaceFolders[0].uri;
		// DO THE EDITED FOLDERS EXIST
		try {
			const cpptestUri = vscode.Uri.joinPath(workspaceUri, 'src/main/cpp');
			const htestUri = vscode.Uri.joinPath(workspaceUri, 'src/main/include');
			await vscode.workspace.fs.stat(cpptestUri);
			await vscode.workspace.fs.stat(htestUri);
		}catch ( err ) {
			vscode.window.showErrorMessage('Folders Not Found.');
		}

		const cppfileUri = vscode.Uri.joinPath(workspaceUri, 'src/main/cpp/' + ClassName + '.cpp');
		const hfileUri = vscode.Uri.joinPath(workspaceUri, 'src/main/include/' + ClassName + '.h');

		// DO THE FILES TO GENERATE ALREADY EXIST
		try {
			await vscode.workspace.fs.stat(cppfileUri);
			vscode.window.showErrorMessage('C++ File Already Exists.');
			return;
		}catch ( err ) {}
		try {
			await vscode.workspace.fs.stat(hfileUri);
			vscode.window.showErrorMessage('H File Already Exists.');
			return;
		}catch ( err ) {}
		
		const headerFileContent = Buffer.from(
`#pragma once

// Local
#include "lib/include/Component.h"

class ` + ClassName + ` : public Component
{
public:
	void PreStepCallback() override;
	void PostStepCallback() override;
private:
};
`, 'utf8');
		
		const cppFileContent = Buffer.from(
`// Local
#include "include/` + ClassName + `.h"

void ` + ClassName + `::PreStepCallback()
{
	
}

void ` + ClassName + `::PostStepCallback()
{
	
}
`, 'utf8');

		
		try {
			await vscode.workspace.fs.writeFile(cppfileUri, cppFileContent);
		} catch (err) {
			vscode.window.showErrorMessage(`Failed to create .cpp file: ${err}`);
		}

		try {
			await vscode.workspace.fs.writeFile(hfileUri, headerFileContent);
		} catch (err) {
			vscode.window.showErrorMessage(`Failed to create .h file: ${err}`);
		}
		
		await vscode.window.showTextDocument(hfileUri);

	});

	let libraryCommand = vscode.commands.registerCommand('dertcpptools.createlibrary', async () => {
        const ClassName = await vscode.window.showInputBox({
			prompt: 'Enter the class name',
		});
		// DOES CLASS NAME EXIST
		if(!ClassName)
		{
			vscode.window.showErrorMessage("Class name is required.");
			return;
		}
		// IS CLASS NAME VALID
		if(!isValidFilenameNameOnly(ClassName))
		{
			vscode.window.showErrorMessage("Class name is not a valid file name.");
			return false;
		}

		const workspaceFolders = vscode.workspace.workspaceFolders;
		// IS AN WORKSPACE OPEN
		if(!workspaceFolders)
		{
			vscode.window.showErrorMessage('No Workspace is open');
			return;
		}
		const workspaceUri = workspaceFolders[0].uri;
		// DO THE FOLDERS EXIST
		try {
			const cpptestUri = vscode.Uri.joinPath(workspaceUri, 'src/main/lib/cpp');
			const htestUri = vscode.Uri.joinPath(workspaceUri, 'src/main/lib/include');
			await vscode.workspace.fs.stat(cpptestUri);
			await vscode.workspace.fs.stat(htestUri);
		}catch ( err ) {
			vscode.window.showErrorMessage('Folders Not Found');
		}

		const cppfileUri = vscode.Uri.joinPath(workspaceUri, 'src/main/lib/cpp/' + ClassName + '.cpp');
		const hfileUri = vscode.Uri.joinPath(workspaceUri, 'src/main/lib/include/' + ClassName + '.h');

		// DO THE FILES TO GENERATE ALREADY EXIST
		try {
			await vscode.workspace.fs.stat(cppfileUri);
			vscode.window.showErrorMessage('C++ File Already Exists.');
			return;
		}catch ( err ) {}
		try {
			await vscode.workspace.fs.stat(hfileUri);
			vscode.window.showErrorMessage('H File Already Exists.');
			return;
		}catch ( err ) {}

		const headerFileContent = Buffer.from(
`#pragma once

class ` + ClassName + `
{
public:
private:
};
`, 'utf8');
		
		const cppFileContent = Buffer.from(
`// Local
#include "lib/include/` + ClassName + `.h"
`, 'utf8');
		
		try {
			await vscode.workspace.fs.writeFile(cppfileUri, cppFileContent);
		} catch (err) {
			vscode.window.showErrorMessage(`Failed to create .cpp file: ${err}`);
		}

		try {
			await vscode.workspace.fs.writeFile(hfileUri, headerFileContent);
		} catch (err) {
			vscode.window.showErrorMessage(`Failed to create .h file: ${err}`);
		}
		
		await vscode.window.showTextDocument(hfileUri);

    });

    context.subscriptions.push(componentCommand);
	context.subscriptions.push(libraryCommand);

}

export function deactivate() {}