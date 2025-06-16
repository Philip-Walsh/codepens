import os
import subprocess
import sys
from bs4 import BeautifulSoup
import cloudscraper
import html
import argparse
# Usage : python scripts/download-pen.py "https://codepen.io/Philip-Walsh/pen/LEVBzeQ" "challenges/ShapesAndLines"


def main(url, folder):
    install_and_check('bs4')
    install_and_check('cloudscraper')
    install_and_check('argparse')

    output_file = "downloaded_page.html"

    html_content = download_html(url)

    formatted_html = prettify_html(html_content)

    with open(output_file, 'w+', encoding='utf-8') as file:
        file.write(formatted_html)

    print(f"Formatted HTML content saved to {output_file}")

    with open(output_file, 'r') as file:
        soup = BeautifulSoup(file, 'html.parser')

    meta_tag = soup.find('meta', attrs={'name': 'twitter:title'})
    human_readable_title = meta_tag['content'] if meta_tag else 'No title'
    title = human_readable_title.lower().replace(' ', '-')
    print(f"Title: {human_readable_title}")

    os.remove(output_file)
    os.makedirs(f"{folder}/{title}", exist_ok=True)
    with open(os.path.join(folder, title, 'index.html'),
              'w', encoding='utf-8') as file:
        file.write(format_html(human_readable_title,
                               extract_code(soup, 'html')))

    with open(os.path.join(folder,  title, 'styles.css'),
              'w', encoding='utf-8') as file:
        file.write(extract_code(soup, 'css'))

    with open(os.path.join(folder, title, 'script.js'),
              'w', encoding='utf-8') as file:
        file.write(extract_code(soup, 'js'))


def install_and_check(package):
    try:
        __import__(package)
    except ImportError:
        print(f"{package} not found. Installing...")
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", package])


def extract_code(soup: BeautifulSoup, target_id: str):

    target = soup.find(id=target_id)
    if not target:
        raise ValueError(f"No element with id: {target_id}")

    code = target.find('code')
    if not code:
        raise ValueError(
            f"No 'code' tag found in element with id: {target_id}")

    return html.unescape(code.get_text(strip=True))


def format_html(title, code):
    return f"""
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <link rel="stylesheet" href="./styles.css" />
    <script src="./script.js" defer></script>
  </head>
  <body>
    {code}
  </body>
</html>
"""


def download_html(url):
    scraper = cloudscraper.create_scraper()
    response = scraper.get(url)
    if response.status_code == 200:
        print("Downloaded content using cloudscraper.")
        return response.text
    else:
        print(
            "Failed to download content using cloudscraper. Status code: "
            f"{response.status_code}")
        raise Exception(
            'Failed to download content using cloudscraper. Status code: ' +
            response.status_code)


def prettify_html(html_content):
    return BeautifulSoup(html_content, 'html.parser').prettify()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Extract and save HTML, CSS, and JS content from a URL.")
    parser.add_argument('url', help="URL of the page to extract content from.")
    parser.add_argument('folder', help="Folder to save the extracted content.")

    args = parser.parse_args()

    main(args.url, args.folder)
