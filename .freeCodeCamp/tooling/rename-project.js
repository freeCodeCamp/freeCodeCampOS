import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function renameProject() {
  // Adjust paths for your FreeCodeCampOS structure
  const projectsPath = path.resolve(__dirname, '../../self/config/projects.json');
  const localesPath = path.resolve(__dirname, '../../locales'); // Optional
  const boilerplatePath = path.resolve(__dirname, '../../boilerplate'); // Optional

  if (!fs.existsSync(projectsPath)) {
    console.error(' Cannot find projects.json at:', projectsPath);
    return;
  }

  const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));

  // Show available projects
  console.log('\n📋 Available projects:');
  projects.forEach(p => {
    console.log(`- ID: ${p.id} | dashedName: ${p.dashedName}`);
  });

  const { currentId, newName, newTitle } = await inquirer.prompt([
    { name: 'currentId', message: 'Enter current project ID or dashed-name:' },
    { name: 'newName', message: 'Enter new dashed-name:' },
    { name: 'newTitle', message: 'Enter new title:' }
  ]);

  // Find the project
  const project = projects.find(
    p => String(p.id) === currentId || p.dashedName === currentId
  );

  if (!project) {
    console.error('Project not found. Please check the ID or dashed-name.');
    return;
  }

  const oldDashedName = project.dashedName;

  // Update fields
  project.dashedName = newName;
  if ('title' in project || newTitle) {
    project.title = newTitle;
  }

  fs.writeFileSync(projectsPath, JSON.stringify(projects, null, 2));
  console.log('Updated project in projects.json');

  // Update locales if directory exists
  if (fs.existsSync(localesPath)) {
    const localeFiles = fs.readdirSync(localesPath);
    for (const file of localeFiles) {
      const localeFile = path.join(localesPath, file);
      const data = JSON.parse(fs.readFileSync(localeFile, 'utf-8'));
      if (data[oldDashedName]) {
        data[newName] = newTitle;
        delete data[oldDashedName];
        fs.writeFileSync(localeFile, JSON.stringify(data, null, 2));
        console.log(`Updated locale: ${file}`);
      }
    }
  }

  // Rename boilerplate directory if exists
  const oldBoilerplateDir = path.join(boilerplatePath, oldDashedName);
  const newBoilerplateDir = path.join(boilerplatePath, newName);
  if (fs.existsSync(oldBoilerplateDir)) {
    fs.renameSync(oldBoilerplateDir, newBoilerplateDir);
    console.log(`Renamed boilerplate directory: ${oldDashedName} → ${newName}`);
  }

  console.log('Project renamed successfully!');
}

renameProject();
