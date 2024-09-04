# import requests
# import cloudscraper


# def fetch_codepen_data(username):
#     print(f'Fetching data for {username}')

#     profile_url = f'https://codepen.io/api/profiles/{username}'
#     pens_url = f'https://codepen.io/{username}/pens/public'

#     print('Fetching profile data')
#     scraper = cloudscraper.create_scraper()
#     # profile_res = scraper.get(profile_url)
#     # if profile_res.status_code == 200:
#     #     print(profile_res.text)
#     #     profile_data = profile_res.json()
#     #     # avatar = profile_data.get(
#     #     #     'avatar_url', 'https://codepen.io/assets/avatars/user-avatar-512x512.png')
#     #     followers = profile_data.get('followers_count', 0)
#     #     print(f'Followers: {followers}')
#     # else:
#     #     # avatar = 'https://codepen.io/assets/avatars/user-avatar-512x512.png'
#     #     followers = 0
#     #     print('Failed to fetch profile data')

#     # Fetch pens data
#     total_views = 0
#     total_loves = 0
#     total_comments = 0
#     pens = 0

#     def get_pens_data(page=1):
#         nonlocal total_views, total_loves, total_comments, pens
#         pens_res = scraper.get(f'{pens_url}?page={page}')
#         if pens_res.status_code == 200:
#             pens_data = pens_res.text
#             print(
#                 f'Fetched {len(pens_data.get("data", []))} pens from page {page}')
#             for pen in pens_data.get('data', []):
#                 total_views += int(pen.get('views', '0').replace(',', ''))
#                 total_loves += int(pen.get('loves', '0'))
#                 total_comments += int(pen.get('comments', '0'))
#                 pens += 1
#             if pens_data.get('next_page'):
#                 get_pens_data(page + 1)
#         else:
#             print(f'Failed to fetch pens from page {page}')
#             print(pens_res)

#     print('Fetching pens data')
#     get_pens_data()
#     print(f'Total views: {total_views}')
#     print(f'Total loves: {total_loves}')
#     print(f'Total comments: {total_comments}')

#     # Generate Markdown content
#     markdown_content = f"""
#     # User Statistics for {username}


#     ## Pens
#     {pens}

#     ## Views
#     {total_views}

#     ## Loves
#     {total_loves}

#     ## Comments
#     {total_comments}

#     ## Ratios
#     - Views per Pen: {total_views // pens if pens else 0}
#     - Loves per Pen: {total_loves // pens if pens else 0}
#     - Comments per Pen: {total_comments / pens if pens else 0:.2f}
#     """

#     # Save Markdown content to a file
#     with open(f'{username}_stats.md', 'w') as f:
#         f.write(markdown_content)

#     print(f'{username}_stats.md saved')


# if __name__ == '__main__':
#     username = 'Philip-Walsh'
#     print(f'Fetching data for {username}')
#     fetch_codepen_data(username)
