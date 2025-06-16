#!/usr/bin/env python3
import os
import json
import hashlib
from pathlib import Path
from bs4 import BeautifulSoup
from datetime import datetime
import argparse


class ProjectIndexBuilder:
    def __init__(self, base_dir="."):
        self.base_dir = Path(base_dir)
        self.cache_file = self.base_dir / ".project_cache.json"
        self.output_file = self.base_dir / "public" / "index.html"
        self.projects = []
        self.cache = self.load_cache()
        self.css_styles = """
        :root {
            --primary: #3b82f6;
            --secondary: #22c55e;
            --tertiary: #06b6d4;
            --accent: #ef4444;
            --background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 50%, rgba(51, 65, 85, 0.95) 100%);
            --surface: rgba(255, 255, 255, 0.08);
            --surface-hover: rgba(255, 255, 255, 0.12);
            --text: #ffffff;
            --text-light: rgba(255, 255, 255, 0.7);
            --text-muted: rgba(255, 255, 255, 0.5);
            --glass-background: rgba(255, 255, 255, 0.1);
            --glass-border: rgba(255, 255, 255, 0.2);
            --squircle-factor: 0.08;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--background), url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');
            background-size: cover;
            background-attachment: fixed;
            color: var(--text);
            line-height: 1.6;
            min-height: 100vh;
            padding: 2rem;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
            background: var(--glass-background);
            backdrop-filter: blur(20px);
            border-radius: calc(var(--squircle-factor) * 200px);
            border: 1px solid var(--glass-border);
            padding: 2rem;
        }
        
        .title {
            font-size: 3rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary), var(--tertiary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 1rem;
        }
        
        .subtitle {
            font-size: 1.2rem;
            color: var(--text-light);
        }
        
        .stats {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-top: 1.5rem;
            flex-wrap: wrap;
        }
        
        .stat {
            background: var(--surface);
            padding: 1rem 1.5rem;
            border-radius: calc(var(--squircle-factor) * 80px);
            border: 1px solid var(--glass-border);
            backdrop-filter: blur(10px);
            text-align: center;
        }
        
        .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--accent);
        }
        
        .stat-label {
            font-size: 0.875rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .section {
            margin-bottom: 2rem;
            background: var(--glass-background);
            border-radius: calc(var(--squircle-factor) * 100px);
            border: 1px solid var(--glass-border);
            overflow: hidden;
        }
        
        .section-header {
            padding: 1.5rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--glass-background);
            transition: background-color 0.3s ease;
        }
        
        .section-header:hover {
            background: var(--surface-hover);
        }
        
        .section-title {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .section-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.5s ease-in-out;
        }
        
        .section.expanded .section-content {
            max-height: 5000px;
            min-height: fit-content;
        }
        
        .section-arrow {
            transform: rotate(0deg);
            transition: transform 0.3s ease;
            font-size: 1.5rem;
        }
        
        .section.expanded .section-arrow {
            transform: rotate(180deg);
        }
        
        .categories-wrapper {
            padding: 0 1.5rem 1.5rem;
        }
        
        .category {
            margin-bottom: 3rem;
        }
        
        .category-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1.5rem;
        }
        
        .project-card {
            background: var(--glass-background);
            backdrop-filter: blur(15px);
            border-radius: calc(var(--squircle-factor) * 100px);
            border: 1px solid var(--glass-border);
            padding: 1.5rem;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .project-card:hover {
            transform: translateY(-8px);
            background: var(--surface-hover);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .project-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--text);
        }
        
        .project-description {
            color: var(--text-light);
            margin-bottom: 1rem;
            font-size: 0.875rem;
            line-height: 1.5;
        }
        
        .project-technologies {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .tech-tag {
            background: var(--surface);
            color: var(--text);
            padding: 0.25rem 0.75rem;
            border-radius: calc(var(--squircle-factor) * 50px);
            font-size: 0.75rem;
            font-weight: 500;
            border: 1px solid var(--glass-border);
        }
        
        .project-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: linear-gradient(135deg, var(--primary), var(--tertiary));
            color: white;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: calc(var(--squircle-factor) * 60px);
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .project-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }
        
        .last-updated {
            text-align: center;
            margin-top: 3rem;
            color: var(--text-muted);
            font-size: 0.875rem;
        }
        
        @media (max-width: 768px) {
            .title { font-size: 2rem; }
            .projects-grid { grid-template-columns: 1fr; }
            .stats { flex-direction: column; align-items: center; }
        }
        """

    def load_cache(self):
        """Load cached project data to avoid unnecessary re-processing"""
        if self.cache_file.exists():
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                pass
        return {}

    def save_cache(self):
        """Save project cache for future runs"""
        with open(self.cache_file, 'w', encoding='utf-8') as f:
            json.dump(self.cache, f, indent=2, default=str)

    def get_file_hash(self, file_path):
        """Get hash of file content for change detection"""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except:
            return None

    def extract_project_info(self, project_path):
        """Extract metadata from a project's index.html"""
        index_file = project_path / "index.html"
        if not index_file.exists():
            return None

        # Check cache first
        cache_key = str(project_path.relative_to(self.base_dir))
        file_hash = self.get_file_hash(index_file)

        if cache_key in self.cache and self.cache[cache_key].get('hash') == file_hash:
            cached_data = self.cache[cache_key].copy()
            cached_data['path'] = cache_key
            return cached_data

        # Parse HTML to extract info
        try:
            with open(index_file, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f.read(), 'html.parser')

            # Extract title
            title_tag = soup.find('title')
            title = title_tag.get_text().strip(
            ) if title_tag else project_path.name.replace('-', ' ').title()

            # Extract description from meta tags
            description = ""
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc:
                description = meta_desc.get('content', '')

            # Check if it has specific technologies
            technologies = []
            html_content = str(soup).lower()

            if 'jquery' in html_content or '$(' in html_content:
                technologies.append('jQuery')
            if 'react' in html_content:
                technologies.append('React')
            if 'vue' in html_content:
                technologies.append('Vue')
            if 'canvas' in html_content:
                technologies.append('Canvas')
            if 'three.js' in html_content or 'threejs' in html_content:
                technologies.append('Three.js')
            if 'gsap' in html_content:
                technologies.append('GSAP')
            if 'squircle' in html_content:
                technologies.append('Squircle UI')

            # Determine category based on path
            path_parts = project_path.parts
            if 'challenges' in path_parts:
                category = path_parts[path_parts.index(
                    'challenges') + 1] if len(path_parts) > path_parts.index('challenges') + 1 else 'misc'
            elif 'other' in path_parts:
                category = 'experiments'
            else:
                category = 'projects'

            project_info = {
                'title': title,
                'description': description or f"Interactive {category} project",
                'path': cache_key,
                'category': category.replace('-', ' ').title(),
                'technologies': technologies,
                'modified': datetime.fromtimestamp(index_file.stat().st_mtime),
                'hash': file_hash
            }

            # Cache the result
            self.cache[cache_key] = project_info.copy()

            return project_info

        except Exception as e:
            print(f"Error processing {project_path}: {e}")
            return None

    def scan_projects(self):
        """Scan for all projects in challenges/ and other/ directories"""
        self.projects = []

        # Scan challenges directory
        challenges_dir = self.base_dir / "challenges"
        if challenges_dir.exists():
            for category_dir in challenges_dir.iterdir():
                if category_dir.is_dir():
                    for project_dir in category_dir.iterdir():
                        if project_dir.is_dir():
                            project_info = self.extract_project_info(
                                project_dir)
                            if project_info:
                                project_info['section'] = 'challenges'
                                self.projects.append(project_info)

        # Scan other directory (including nested categories)
        other_dir = self.base_dir / "other"
        if other_dir.exists():
            for category_dir in other_dir.iterdir():
                if category_dir.is_dir():
                    # Check if it's a project directory (has index.html)
                    if (category_dir / "index.html").exists():
                        project_info = self.extract_project_info(category_dir)
                        if project_info:
                            project_info['section'] = 'other'
                            self.projects.append(project_info)
                    # If not, it might be a category directory
                    else:
                        for project_dir in category_dir.iterdir():
                            if project_dir.is_dir():
                                project_info = self.extract_project_info(
                                    project_dir)
                                if project_info:
                                    project_info['section'] = 'other'
                                    project_info['category'] = category_dir.name.replace(
                                        '-', ' ').title()
                                    self.projects.append(project_info)

        # Sort projects by section, category, then title
        self.projects.sort(key=lambda x: (
            x['section'], x['category'], x['title']))

        print(f"Found {len(self.projects)} projects")

    def generate_html(self):
        """Generate the home page HTML"""
        # Group projects by main section (Challenges/Other) and then by category
        sections = {
            'challenges': {'title': '🏆 Challenges', 'categories': {}},
            'other': {'title': '🔬 Other Projects', 'categories': {}}
        }

        for project in self.projects:
            path_parts = Path(project['path']).parts
            if 'challenges' in path_parts:
                section = 'challenges'
            else:
                section = 'other'

            cat = project['category']
            if cat not in sections[section]['categories']:
                sections[section]['categories'][cat] = []
            sections[section]['categories'][cat].append(project)

        # JavaScript for dropdowns
        dropdown_script = """
            document.addEventListener('DOMContentLoaded', function() {
                document.querySelectorAll('.section-header').forEach(header => {
                    header.addEventListener('click', () => {
                        const section = header.parentElement;
                        section.classList.toggle('expanded');
                    });
                });
                
                // Expand the Challenges section by default
                document.querySelector('.section[data-section="challenges"]').classList.add('expanded');
            });
        """

        # Start building the HTML
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌟 Project Portfolio - Interactive Creations</title>
    <style>
        {self.css_styles}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">🌟 Philip Walsh Codepen Sauce 🍝</h1>
            <p class="subtitle">A collection of creative coding experiments and challenges</p>
            <div class="stats">
                <div class="stat">
                    <div class="stat-value">{len(self.projects)}</div>
                    <div class="stat-label">Projects</div>
                </div>
                <div class="stat">
                    <div class="stat-value">{len(set(p['category'] for p in self.projects))}</div>
                    <div class="stat-label">Categories</div>
                </div>
                <div class="stat">
                    <div class="stat-value">{len(set(t for p in self.projects for t in p['technologies']))}</div>
                    <div class="stat-label">Technologies</div>
                </div>
            </div>
        </div>
        
        <div class="content">
"""

        # Add each section (Challenges/Other)
        for section_key, section_data in sections.items():
            if section_data['categories']:
                html += f"""
            <div class="section" data-section="{section_key}">
                <div class="section-header">
                    <h2 class="section-title">
                        <span>{section_data['title']}</span>
                        <span>({sum(len(projs) for projs in section_data['categories'].values())})</span>
                    </h2>
                    <span class="section-arrow">▼</span>
                </div>
                <div class="section-content">
                    <div class="categories-wrapper">
"""

                # Add categories within each section
                for category, projects in sorted(section_data['categories'].items()):
                    html += f"""
                        <div class="category">
                            <h2 class="category-title">
                                <span>{'🚀' if section_key == 'challenges' else '🔬'}</span>
                                <span>{category}</span>
                                <span>({len(projects)})</span>
                            </h2>
                            <div class="projects-grid">
"""

                    for project in sorted(projects, key=lambda x: x['title']):
                        html += f"""
                                <div class="project-card">
                                    <h3 class="project-title">{project['title']}</h3>
                                    <p class="project-description">{project['description']}</p>
                                    <div class="project-technologies">
                                        {''.join(f'<span class="tech-tag">{tech}</span>' for tech in project['technologies'])}
                                    </div>
                                    <a href="/{project['path']}" class="project-link">
                                        <span>View Project</span>
                                        <span>→</span>
                                    </a>
                                </div>
"""

                    html += """
                            </div>
                        </div>
"""

                html += """
                    </div>
                </div>
            </div>
"""

        # Close the HTML
        html += f"""
        </div>
        
        <div class="last-updated">
            Last updated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
        </div>
    </div>
    <script>
        {dropdown_script}
    </script>
</body>
</html>
"""

        # Write the generated HTML to file
        with open(self.output_file, 'w', encoding='utf-8') as f:
            f.write(html)

        print("✅ Home page built successfully:", self.output_file)
        print("🌐 View at: http://localhost:3000")

    def build(self):
        """Main build process"""
        print("🔍 Scanning for projects...")
        self.scan_projects()

        print("🏗️  Building home page...")
        self.generate_html()

        # Save cache
        self.save_cache()


def main():
    parser = argparse.ArgumentParser(description="Build project index page")
    parser.add_argument('--watch', action='store_true',
                        help="Watch for changes and rebuild")
    parser.add_argument('--dir', default='.', help="Base directory to scan")

    args = parser.parse_args()

    builder = ProjectIndexBuilder(args.dir)

    if args.watch:
        import time
        print("👀 Watching for changes...")
        last_build = 0

        while True:
            try:
                # Check if any project files have changed
                should_rebuild = False
                current_time = time.time()

                if current_time - last_build > 5:  # Check every 5 seconds
                    for root, dirs, files in os.walk(builder.base_dir):
                        for file in files:
                            if file == 'index.html':
                                file_path = Path(root) / file
                                if file_path.stat().st_mtime > last_build:
                                    should_rebuild = True
                                    break
                        if should_rebuild:
                            break

                if should_rebuild:
                    builder.build()
                    last_build = current_time

                time.sleep(1)

            except KeyboardInterrupt:
                print("\n👋 Stopped watching")
                break
    else:
        builder.build()


if __name__ == "__main__":
    # Install dependencies
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        print("Installing BeautifulSoup4...")
        os.system("pip install beautifulsoup4")
        from bs4 import BeautifulSoup

    main()
