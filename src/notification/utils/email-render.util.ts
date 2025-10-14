import { readFile } from 'fs/promises';
import Handlebars from 'handlebars';
import mjml2html from 'mjml';
import { join } from 'path';

const isProd = process.env.NODE_ENV === 'production';

export async function renderTemplate(templateName: string, data: Record<string, any>) {
  const templatePath = isProd
    ? join(__dirname, '..', 'templates', templateName) // dist
    : join(process.cwd(), 'dist', 'notification', 'templates', templateName); // src
  console.log('Template Path:', templatePath); // Debugging line
  const rawMjml = await readFile(templatePath, 'utf-8');
  const compiled = Handlebars.compile(rawMjml);
  const mjmlContent = compiled(data);
  const { html } = mjml2html(mjmlContent);
  return html;
}
