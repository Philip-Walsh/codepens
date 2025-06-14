#!/usr/bin/env python3
import os
import json
from pathlib import Path
import argparse
from datetime import datetime


def parse_args():
    parser = argparse.ArgumentParser(
        description='Generate statistics about CodePen projects')
    parser.add_argument(
        '--output', '-o', help='Output file for statistics (default: stats.json)')
    parser.add_argument('--format', '-f', choices=['json', 'markdown'], default='json',
                        help='Output format (default: json)')
    return parser.parse_args()


def main():
    args = parse_args()
    base_dir = Path(__file__).parent.parent
    stats = {
        'total_projects': 0,
        'categories': {},
        'technologies': {},
        'last_updated': datetime.now().isoformat()
    }

    # Scan challenges directory
    challenges_dir = base_dir / "challenges"
    if challenges_dir.exists():
        for category_dir in challenges_dir.iterdir():
            if category_dir.is_dir():
                category = category_dir.name
                stats['categories'][category] = 0
                for project_dir in category_dir.iterdir():
                    if project_dir.is_dir():
                        stats['total_projects'] += 1
                        stats['categories'][category] += 1

                        # Check for technologies
                        index_file = project_dir / "index.html"
                        if index_file.exists():
                            with open(index_file, 'r', encoding='utf-8') as f:
                                content = f.read().lower()
                                if 'jquery' in content or '$(' in content:
                                    stats['technologies']['jQuery'] = stats['technologies'].get(
                                        'jQuery', 0) + 1
                                if 'react' in content:
                                    stats['technologies']['React'] = stats['technologies'].get(
                                        'React', 0) + 1
                                if 'canvas' in content:
                                    stats['technologies']['Canvas'] = stats['technologies'].get(
                                        'Canvas', 0) + 1
                                if 'squircle' in content:
                                    stats['technologies']['Squircle UI'] = stats['technologies'].get(
                                        'Squircle UI', 0) + 1

    # Output statistics
    if args.format == 'json':
        output_file = args.output or 'stats.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(stats, f, indent=2)
        print(f"✅ Statistics saved to {output_file}")
    else:
        # Generate markdown
        md = f"""# CodePen Project Statistics

Last updated: {datetime.now().strftime('%B %d, %Y')}

## Overview
- Total Projects: {stats['total_projects']}
- Categories: {len(stats['categories'])}
- Technologies: {len(stats['technologies'])}

## Categories
"""
        for category, count in sorted(stats['categories'].items()):
            md += f"- {category}: {count} projects\n"

        md += "\n## Technologies\n"
        for tech, count in sorted(stats['technologies'].items()):
            md += f"- {tech}: {count} projects\n"

        output_file = args.output or 'stats.md'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(md)
        print(f"✅ Statistics saved to {output_file}")


if __name__ == '__main__':
    main()
