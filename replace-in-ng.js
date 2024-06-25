const { glob } = require("glob")
const fs = require('fs-extra');
const { exec } = require("child_process");

const customComponentImport = "import { TbyIconComponent } from '@general/components/tby-icon/tby-icon.component';";
const customComponentTag = '<app-tby-icon';
const waitingFormatFiles = [];

glob("src/**/*.html").then(async result => {
    result.forEach(htmlFile => {
        const htmlContent = fs.readFileSync(htmlFile, 'utf8');
        if (htmlContent.includes(customComponentTag)) {
          const tsFile = htmlFile.replace('.html', '.ts');
          if (fs.existsSync(tsFile)) {
            addCustomComponentImport(tsFile);
          }
        }
      });

      let index = 0;
      for (const path of waitingFormatFiles) {
        try {
          console.log(`start format: ${path} ... (${index} / ${waitingFormatFiles.length})`);
          await format(path);
          index ++;
        } catch(err) {
          console.log(err)
        }
      }

      console.log("Run script done!!");

}).catch(err => console.log(err));

function addCustomComponentImport(filePath) {
  let fileContent = fs.readFileSync(filePath, 'utf8');
  if (!fileContent.includes('import { TbyIconComponent }')) {
    // add in imports
      const componentDeclareIndex = fileContent.indexOf('@Component');
      const indexOfImportsInDeclare = fileContent.indexOf('imports:', componentDeclareIndex);
      const indexOfImportsEnd = fileContent.indexOf(']', indexOfImportsInDeclare);
      const prefix = fileContent[indexOfImportsEnd-1] === ' ' ? '' : ', ';
      fileContent = fileContent.slice(0, indexOfImportsEnd) + prefix + 'TbyIconComponent,' + fileContent.slice(indexOfImportsEnd, fileContent.length);
      const lastImportIndex = fileContent.lastIndexOf('import ');
      fileContent = fileContent.slice(0, lastImportIndex) + customComponentImport + '\n' + fileContent.slice(lastImportIndex);
      fs.writeFileSync(filePath, fileContent, 'utf8');
      waitingFormatFiles.push(filePath);
  } else {
      console.log(`File ${filePath} already has the custom component import.`);
  }
};

function format(path) {
  return new Promise((resolve, reject) => {
    exec(`npx prettier --write ${path}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running Prettier: ${error}`);
        reject(error.message);
        return;
      }
      console.log(`Prettier output: ${stdout}`);
      resolve(stdout);

      if (stderr) {
        console.error(`Prettier error: ${stderr}`);
        reject(stderr);
      }
    })
  });
}
