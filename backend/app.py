from flask import Flask, request, jsonify, send_file,Response,make_response,send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import instaloader
import yt_dlp
import os
import time
import requests
from urllib.parse import quote
import mimetypes
from urllib.parse import urlparse
import re
import json
from urllib.parse import urljoin, urlparse, urlunparse
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from playwright.sync_api import sync_playwright
from selenium.webdriver.common.by import By
from PIL import Image
import io
import sys
from models.database import Database

from email_service import EmailService
from auth_routes import AuthRoutes
from config import Config
from social_auth import init_social_auth, handle_social_auth
from oauth import init_oauth
import jwt
from datetime import datetime,timedelta
import dateutil.parser  # Add this import at the top


sys.path.append(os.path.dirname(os.path.abspath(__file__)))








app = Flask(__name__)


# Basic CORS configuration
CORS(app)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})


if not os.path.exists('uploads'):
    os.makedirs('uploads')













# Add custom headers to all responses
@app.after_request
def add_cors_headers(response):
    # Allow requests from your frontend domain
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    
    # Allow credentials
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    
    # Allow specific headers
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    
    # Allow specific methods
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    
    # Remove COOP header that's causing issues
    if 'Cross-Origin-Opener-Policy' in response.headers:
        del response.headers['Cross-Origin-Opener-Policy']
    
    return response

# Handle OPTIONS requests explicitly
@app.route('/api/auth/social-login', methods=['OPTIONS'])
def handle_options():
    response = make_response()
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response
# Load configuration
config_name = os.getenv('FLASK_ENV', 'development')
app.config.from_object(Config)  # Use the imported Config class directly

# Initialize services
db = Database(app.config['DATABASE_NAME'])
email_service = EmailService(Config)


# Initialize routes
auth_routes = AuthRoutes(app, db, email_service, Config())
# handle_social_auth(auth_routes)handle_social_auth(auth_routes)


# init_oauth(app, db)
# Initialize database
db.init_db()











def debug_log(message, data=None):
    print(f"[DEBUG] {message}")
    if data:
        print(json.dumps(data, indent=2))


def get_network_images(url):
    """
    Capture all images loaded through network requests on a webpage
    including dynamically loaded images
    """
    try:
        # Set up Chrome options for headless browsing
        chrome_options = Options()
        chrome_options.add_argument('--headless')  # Run in headless mode
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        
        # Initialize performance logging
        chrome_options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})
        
        # Create a new ChromeDriver instance
        driver = webdriver.Chrome(options=chrome_options)
        
        # Create a set to store unique image URLs
        image_urls = set()
        
        try:
            # Navigate to the URL
            driver.get(url)
            
            # Wait for dynamic content to load
            time.sleep(3)
            
            # Get all network logs
            logs = driver.get_log('performance')
            
            # Process network logs
            for entry in logs:
                    # Parse network requests
                    import json
                    log = json.loads(entry['message'])['message']
                    
                    # Check if this is a network request
                    if (
                        'Network.responseReceived' in log['method'] or 
                        'Network.requestWillBeSent' in log['method']
                    ):
                        if 'response' in log.get('params', {}):
                            response = log['params']['response']
                            url = response.get('url', '')
                            mime_type = response.get('mimeType', '')
                            
                            # Check if the response is an image
                            if any(mime_type.startswith(t) for t in ['image/', 'application/octet-stream']):
                                image_urls.add(url)
                                
                        elif 'request' in log.get('params', {}):
                            request = log['params']['request']
                            url = request.get('url', '')
                            if any(url.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico']):
                                image_urls.add(url)
            
            # Also get images from img tags
            img_elements = driver.find_elements('tag name', 'img')
            for img in img_elements:
                src = img.get_attribute('src')
                if src:
                    absolute_url = urljoin(url, src)
                    image_urls.add(absolute_url)
                    
                # Check data-src attribute for lazy-loaded images
                data_src = img.get_attribute('data-src')
                if data_src:
                    absolute_url = urljoin(url, data_src)
                    image_urls.add(absolute_url)
                    
            # Get background images from computed styles
            elements = driver.find_elements('css selector', '*')
            for element in elements:
                try:
                    bg_image = driver.execute_script(
                        """
                        var style = window.getComputedStyle(arguments[0]);
                        return style.getPropertyValue('background-image');
                        """, 
                        element
                    )
                    if bg_image and bg_image != 'none':
                        # Extract URL from background-image
                        bg_url = bg_image.strip().lstrip('url("').rstrip('")')
                        if bg_url:
                            absolute_url = urljoin(url, bg_url)
                            image_urls.add(absolute_url)
                except:
                    continue
                    
        finally:
            # Always close the browser
            driver.quit()
            
        # Filter out data URLs and empty strings
        valid_urls = [url for url in image_urls if url.startswith('http')]
        medialist=[];
        for img in valid_urls:
                medialist.append({
                    'type': 'image',
                    'url': img,
                    'thumbnail': img
                })
        
        return medialist
        
    except Exception as e:
        debug_log(f"Error in Facebook extraction: {str(e)}")
        return None

# Optional: Add a route to check image accessibility
def get_instagram_info(url):
    debug_log(f"Starting Instagram media extraction for URL: {url}")

    try:
        L = instaloader.Instaloader(download_pictures=False, 
                                  download_videos=False, 
                                  download_video_thumbnails=False,
                                  download_geotags=False,
                                  download_comments=False,
                                  save_metadata=False)
        
        shortcode = url.split("/p/")[1].split("/")[0]
        post = instaloader.Post.from_shortcode(L.context, shortcode)
        
        media_list = []
        
        if not post.typename == "GraphSidecar":
            url = post.video_url if post.is_video else post.url
            media_list.append({
                'type': 'video' if post.is_video else 'image',
                'url': url,
                'thumbnail': post.url
            })
        else:
            for node in post.get_sidecar_nodes():
                display_url = node.display_url
                is_video = node.is_video
                media_url = node.video_url if is_video else display_url
                
                media_list.append({
                    'type': 'video' if is_video else 'image',
                    'url': media_url,
                    'thumbnail': display_url
                })

        return media_list
    except Exception as e:
        debug_log(f"Error in Instagram extraction: {str(e)}")
        return None


# @app.route('/api/info', methods=['POST'])
# def get_media_info():
#     try:
#         data = request.get_json()
#         url = data.get('url')
        
#         if not url:
#             return jsonify({'error': 'URL is required'}), 400
        
#         # List of media extensions and their types
#         media_extensions = {
#             # Images
#             '.jpg': {'type': 'image', 'mime': 'image/jpeg'},
#             '.jpeg': {'type': 'image', 'mime': 'image/jpeg'},
#             '.png': {'type': 'image', 'mime': 'image/png'},
#             '.gif': {'type': 'image', 'mime': 'image/gif'},
#             '.webp': {'type': 'image', 'mime': 'image/webp'},
#             '.svg': {'type': 'image', 'mime': 'image/svg+xml'},
#             # Videos
#             '.mp4': {'type': 'video', 'mime': 'video/mp4'},
#             '.mov': {'type': 'video', 'mime': 'video/quicktime'},
#             '.avi': {'type': 'video', 'mime': 'video/x-msvideo'},
#             '.mkv': {'type': 'video', 'mime': 'video/x-matroska'},
#             '.webm': {'type': 'video', 'mime': 'video/webm'},
#             # Audio
#             '.mp3': {'type': 'audio', 'mime': 'audio/mpeg'},
#             '.wav': {'type': 'audio', 'mime': 'audio/wav'},
#             '.ogg': {'type': 'audio', 'mime': 'audio/ogg'},
#             '.m4a': {'type': 'audio', 'mime': 'audio/mp4'},
#             # Documents
#             '.pdf': {'type': 'document', 'mime': 'application/pdf'},
#             '.doc': {'type': 'document', 'mime': 'application/msword'},
#             '.docx': {'type': 'document', 'mime': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}
#         }
#          # Check if URL ends with a media extension
#         url_lower = url.lower()
#         file_extension = None
#         media_type = None

#         for ext, info in media_extensions.items():
#             if url_lower.endswith(ext):
#                 file_extension = ext
#                 media_type = info
#                 break
#          if media_type:
#             # Handle direct media file
#             try:
#                 # Send HEAD request first to get content info
#                 head_response = requests.head(url, allow_redirects=True, timeout=10)
                
#                 if not head_response.ok:
#                     return jsonify({'error': 'Failed to access media file'}), 404

#                 # Get content info
#                 content_type = head_response.headers.get('content-type', media_type['mime'])
#                 content_length = int(head_response.headers.get('content-length', 0))
                
#                 # Generate filename from URL
#                 filename = url.split('/')[-1]
                
#                 # Create media info response
#                 media_info = {
#                     'success': True,
#                     'postUrl': url,
#                     'mediaCount': 1,
#                     'isGallery': False,
#                     'media': [{
#                         'type': media_type['type'],
#                         'url': url,
#                         'filename': filename,
#                         'mime_type': content_type,
#                         'size': content_length,
#                         'extension': file_extension,
#                         'thumbnail': url if media_type['type'] == 'image' else None
#                     }]
#                 }
#                 if media_type['type'] == 'image' and content_length > 0:
#                     try:
#                         img_response = requests.get(url, stream=True, timeout=10)
#                         if img_response.ok:
#                             img = Image.open(io.BytesIO(img_response.content))
#                             media_info['media'][0]['width'] = img.width
#                             media_info['media'][0]['height'] = img.height
#                     except:
#                         pass
#                     return jsonify(media_info)
#             except Exception as e:
#                 debug_log(f"Error processing media file: {str(e)}")
#                 return jsonify({'error': str(e)}), 500


#         media_list = None
        
#         # Try Instagram-specific extraction first if it's an Instagram URL
#         if 'instagram.com/p/' in url:
#             media_list = get_instagram_info(url)

#         # Try YouTube if Instagram failed
#         if not media_list:
#             youtube_info = get_youtube_info(url)
#             if youtube_info:
#                 return youtube_info  # Return YouTube info directly as it's already jsonified

#         # If both Instagram and YouTube failed, try generic extraction
#         if not media_list:
#             media_list = get_network_images(url)
        
        
        
#         if not media_list:
#             return jsonify({'error': 'No media found'}), 404

#         # Return the media list response
#         return jsonify({
#             'success': True,
#             'postUrl': url,
#             'mediaCount': len(media_list),
#             'media': media_list,
#             'isGallery': len(media_list) > 1
#         })

#     except Exception as e:
#         debug_log(f"Error processing request: {str(e)}")
#         return jsonify({'error': str(e)}), 500
@app.route('/api/info', methods=['POST'])
def get_media_info():
    try:
        data = request.get_json()
        url = data.get('url')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400

        # List of media extensions and their types
        media_extensions = {
            # Images
            '.jpg': {'type': 'image', 'mime': 'image/jpeg'},
            '.jpeg': {'type': 'image', 'mime': 'image/jpeg'},
            '.png': {'type': 'image', 'mime': 'image/png'},
            '.gif': {'type': 'image', 'mime': 'image/gif'},
            '.webp': {'type': 'image', 'mime': 'image/webp'},
            '.svg': {'type': 'image', 'mime': 'image/svg+xml'},
            # Videos
            '.mp4': {'type': 'video', 'mime': 'video/mp4'},
            '.mov': {'type': 'video', 'mime': 'video/quicktime'},
            '.avi': {'type': 'video', 'mime': 'video/x-msvideo'},
            '.mkv': {'type': 'video', 'mime': 'video/x-matroska'},
            '.webm': {'type': 'video', 'mime': 'video/webm'},
            # Audio
            '.mp3': {'type': 'audio', 'mime': 'audio/mpeg'},
            '.wav': {'type': 'audio', 'mime': 'audio/wav'},
            '.ogg': {'type': 'audio', 'mime': 'audio/ogg'},
            '.m4a': {'type': 'audio', 'mime': 'audio/mp4'},
            # Documents
            '.pdf': {'type': 'document', 'mime': 'application/pdf'},
            '.doc': {'type': 'document', 'mime': 'application/msword'},
            '.docx': {'type': 'document', 'mime': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}
        }

        # Check if URL ends with a media extension
        url_lower = url.lower()
        file_extension = None
        media_type = None

        for ext, info in media_extensions.items():
            if url_lower.endswith(ext):
                file_extension = ext
                media_type = info
                break

        if media_type:
            # Handle direct media file
            try:
                # Send HEAD request first to get content info
                head_response = requests.head(url, allow_redirects=True, timeout=10)
                
                if not head_response.ok:
                    return jsonify({'error': 'Failed to access media file'}), 404

                # Get content info
                content_type = head_response.headers.get('content-type', media_type['mime'])
                content_length = int(head_response.headers.get('content-length', 0))
                
                # Generate filename from URL
                filename = url.split('/')[-1]
                
                # Create media info response
                media_info = {
                    'success': True,
                    'postUrl': url,
                    'mediaCount': 1,
                    'isGallery': False,
                    'media': [{
                        'type': media_type['type'],
                        'url': url,
                        'filename': filename,
                        'mime_type': content_type,
                        'size': content_length,
                        'extension': file_extension,
                        'thumbnail': url if media_type['type'] == 'image' else None
                    }]
                }

                # For images, try to get dimensions
                if media_type['type'] == 'image' and content_length > 0:
                    try:
                        img_response = requests.get(url, stream=True, timeout=10)
                        if img_response.ok:
                            img = Image.open(io.BytesIO(img_response.content))
                            media_info['media'][0]['width'] = img.width
                            media_info['media'][0]['height'] = img.height
                    except:
                        pass

                return jsonify(media_info)

            except Exception as e:
                debug_log(f"Error processing media file: {str(e)}")
                return jsonify({'error': str(e)}), 500

        # If not a direct media file, proceed with regular extraction
        media_list = None
        
        # Try Instagram-specific extraction
        if 'instagram.com/p/' in url:
            media_list = get_instagram_info(url)

        # Try YouTube
        if not media_list:
            youtube_info = get_youtube_info(url)
            if youtube_info:
                return youtube_info

        # Try generic extraction
        if not media_list:
            media_list = get_network_images(url)

        if not media_list:
            return jsonify({'error': 'No media found'}), 404

        # Return the media list response
        return jsonify({
            'success': True,
            'postUrl': url,
            'mediaCount': len(media_list),
            'media': media_list,
            'isGallery': len(media_list) > 1
        })

    except Exception as e:
        debug_log(f"Error processing request: {str(e)}")
        return jsonify({'error': str(e)}), 500
# @app.route('/api/info', methods=['POST'])
# def get_video_info():
#     try:
#         data = request.get_json()
#         url = data.get('url')
        
#         if not url:
#             return jsonify({'error': 'URL is required'}), 400

#         # Check if it's an Instagram URL
#         if 'instagram.com/p/' in url:
#             return get_instagram_info(url)
        
#         # Original YouTube handling
#         return get_youtube_info(url)

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500





# def get_instagram_info(url):
#     debug_log(f"Starting media extraction for URL: {url}")

#     try:
#         # Initialize instaloader without login
#         L = instaloader.Instaloader(download_pictures=False, 
#                                   download_videos=False, 
#                                   download_video_thumbnails=False,
#                                   download_geotags=False,
#                                   download_comments=False,
#                                   save_metadata=False)
        
#         # Extract post shortcode from URL
#         shortcode = url.split("/p/")[1].split("/")[0]
#         debug_log(f"Extracted shortcode: {shortcode}")
        
#         # Get post by shortcode
#         post = instaloader.Post.from_shortcode(L.context, shortcode)
        
#         media_list = []
        
#         # Handle single post
#         if not post.typename == "GraphSidecar":
#             url = post.video_url if post.is_video else post.url
#             media_list.append({
#                 'type': 'video' if post.is_video else 'image',
#                 'url': url,
#                 'thumbnail': post.url
#             })
#         # Handle carousel/multiple images
#         else:
#             for node in post.get_sidecar_nodes():
#                 # Get the display URL for both images and videos
#                 display_url = node.display_url
                
#                 # Determine if it's a video and get video URL if it is
#                 is_video = node.is_video
#                 media_url = node.video_url if is_video else display_url
                
#                 media_list.append({
#                     'type': 'video' if is_video else 'image',
#                     'url': media_url,
#                     'thumbnail': display_url
#                 })

#         debug_log(f"Found {len(media_list)} media items")
#         debug_log("Media list:", media_list)
        
#         return jsonify({
#             'success': True,
#             'postUrl': url,
#             'mediaCount': len(media_list),
#             'media': media_list,
#             'isGallery': len(media_list) > 1
#         })

#     except Exception as e:
#         debug_log(f"Error in media extraction: {str(e)}")
#         import traceback
#         debug_log("Full traceback:", traceback.format_exc())
#         return jsonify({'error': str(e)}), 500



# def get_instagram_info(url):
#     debug_log(f"Starting media extraction for URL: {url}")

#     try:
#         # Extract post ID from URL
#         post_id = url.split('/p/')[1].split('/')[0]
        
#         # Instagram GraphQL API endpoint
#         api_url = f"https://www.instagram.com/graphql/query/"
        
#         headers = {
#             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
#             'Accept': '*/*',
#             'Accept-Language': 'en-US,en;q=0.5',
#             'Accept-Encoding': 'gzip, deflate, br',
#             'X-IG-App-ID': '936619743392459',  # Instagram web app ID
#             'X-Requested-With': 'XMLHttpRequest',
#             'Connection': 'keep-alive',
#             'Referer': 'https://www.instagram.com/',
#             'Sec-Fetch-Dest': 'empty',
#             'Sec-Fetch-Mode': 'cors',
#             'Sec-Fetch-Site': 'same-origin',
#         }

#         cookies = {
#             'ig_did': str(uuid.uuid4()),
#             'ig_nrcb': '1',
#             'csrftoken': str(uuid.uuid4()),
#             'mid': str(uuid.uuid4()),
#         }

#         params = {
#             'query_hash': 'b3055c01b4b222b8a47dc12b090e4e64',  # Instagram's query hash for post details
#             'variables': json.dumps({
#                 "shortcode": post_id,
#                 "child_comment_count": 0,
#                 "fetch_comment_count": 0,
#                 "parent_comment_count": 0,
#                 "has_threaded_comments": False
#             })
#         }

#         session = requests.Session()
#         response = session.get(api_url, headers=headers, cookies=cookies, params=params)
        
#         if not response.ok:
#             debug_log(f"API request failed: {response.status_code}")
#             return jsonify({'error': 'Failed to fetch Instagram post data'}), 500

#         data = response.json()
#         debug_log("API Response:", data)

#         media_urls = set()
#         media = data.get('data', {}).get('shortcode_media', {})

#         if media:
#             # Handle carousel posts
#             if media.get('__typename') == 'GraphSidecar':
#                 edges = media.get('edge_sidecar_to_children', {}).get('edges', [])
#                 for edge in edges:
#                     node = edge.get('node', {})
#                     if node.get('is_video'):
#                         media_urls.add(node.get('video_url'))
#                     else:
#                         media_urls.add(node.get('display_url'))
#             # Handle single video
#             elif media.get('is_video'):
#                 media_urls.add(media.get('video_url'))
#             # Handle single image
#             else:
#                 media_urls.add(media.get('display_url'))

#         # Format media list
#         media_list = []
#         for url in media_urls:
#             if url:  # Only add if URL is not None
#                 media_type = 'video' if any(ext in url.lower() for ext in ['.mp4', '.mov', '.m4v']) else 'image'
#                 media_list.append({
#                     'type': media_type,
#                     'url': url.replace('\\u0026', '&'),
#                     'thumbnail': url if media_type == 'image' else None
#                 })

#         debug_log(f"Found {len(media_list)} media items")

#         return jsonify({
#             'success': True,
#             'postUrl': url,
#             'mediaCount': len(media_list),
#             'media': media_list,
#             'isGallery': len(media_list) > 1
#         })

#     except Exception as e:
#         debug_log(f"Error in media extraction: {str(e)}")
#         return jsonify({'error': str(e)}), 500


        
def get_youtube_info(url):
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            # Separate video and audio formats
            video_formats = []
            audio_formats = []
           
            for f in info['formats']:
                if f.get('ext') != 'webm':
                    format_info = {
                        'format_id': f['format_id'],
                        'ext': f['ext'],
                        'filesize': f.get('filesize'),
                        'format_note': f.get('format_note', ''),
                        'acodec': 'none',
                    }
                    if f.get('acodec') != 'none' and f.get('vcodec') != 'none':
                        format_info.update({
                            'resolution': f.get('resolution', 'N/A'),
                            'fps': f.get('fps', 'N/A'),
                            'vcodec': f.get('vcodec', 'N/A'),
                            'abr': f.get('abr', 'N/A'),
                            'acodec': f.get('acodec', 'N/A'),
                        })
                        video_formats.append(format_info)
                    
                    if f.get('acodec') != 'none' and f.get("ext")!="mp4":
                        format_info.update({
                            'abr': f.get('abr', 'N/A'),
                            'acodec': f.get('acodec', 'N/A'),
                        })
                        audio_formats.append(format_info)

            return jsonify({
                'title': info['title'],
                'thumbnail': info.get('thumbnail'),
                'duration': info.get('duration'),
                'uploader': info.get('uploader'),
                'video_formats': video_formats,
                'audio_formats': audio_formats
            })

    except Exception as e:
        debug_log(f"Error processing request: {str(e)}")
        return None





@app.route('/api/proxy-media', methods=['GET'])
def proxy_media():
    media_url = request.args.get('url')
    if not media_url:
        return jsonify({'error': 'Media URL is required'}), 400

    try:
        session = requests.Session()
        
        # Set comprehensive headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': urlparse(media_url).scheme + '://' + urlparse(media_url).netloc,
        }

        # Make HEAD request first to check content type and size
        head_response = session.head(media_url, headers=headers, allow_redirects=True, timeout=10)
        content_type = head_response.headers.get('content-type', 'application/octet-stream')
        content_length = head_response.headers.get('content-length', '0')

        # Get the actual file
        response = session.get(
            media_url,
            headers=headers,
            stream=True,
            timeout=30,
            allow_redirects=True
        )

        if not response.ok:
            return jsonify({'error': f'Failed to fetch media: {response.status_code}'}), response.status_code

        # Get filename from Content-Disposition or URL
        filename = None
        content_disposition = response.headers.get('content-disposition')
        if content_disposition and 'filename=' in content_disposition:
            filename = re.findall("filename=(.+)", content_disposition)[0].strip('"')
        
        if not filename:
            filename = media_url.split('/')[-1].split('?')[0]
            # If no extension in filename, add it based on content-type
            if '.' not in filename:
                ext = mimetypes.guess_extension(content_type)
                if ext:
                    filename += ext

        # Set response headers
        headers = {
            'Content-Type': content_type,
            'Content-Length': content_length,
            'Content-Disposition': f'attachment; filename="{quote(filename)}"',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }

        def generate():
            try:
                # Use larger chunk size for better performance
                for chunk in response.iter_content(chunk_size=8192 * 16):
                    if chunk:
                        yield chunk
            except Exception as e:
                debug_log(f"Error during file streaming: {str(e)}")
                raise
            finally:
                response.close()
                session.close()
        user_id = None
        try:
          token = request.cookies.get('auth_token')
          if token:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
        except:
           pass  # Continue without user_id if not authenticated
        print(user_id)
            # Record the download
        db.record_download(media_url, "image", user_id)
        return Response(
            generate(),
            headers=headers,
            direct_passthrough=True
        )

    except Exception as e:
        debug_log(f"Error in proxy_media: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ... rest of the imports and initial setup ...

@app.route('/api/download', methods=['GET'])
def download_video():
    try:
        url = request.args.get('url')
        format_id = request.args.get('format_id')
        format_type = request.args.get('type', 'video')
        if not url or not format_id:
            return jsonify({'error': 'URL is required'}), 400

        ydl_opts = {
            'format': format_id,
            'quiet': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            format_info = next(f for f in info['formats'] if f['format_id'] == format_id)
            download_url = format_info['url']
            
            # Configure requests session with retry strategy
            session = requests.Session()
            adapter = requests.adapters.HTTPAdapter(
                max_retries=3,
                pool_connections=10,
                pool_maxsize=10
            )
            session.mount('http://', adapter)
            session.mount('https://', adapter)
            
            # Get the file using configured session
            response = session.get(
                download_url, 
                stream=True,
                timeout=30,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            )
            
            if not response.ok:
                return jsonify({'error': 'Failed to fetch video'}), 500

            # Get total file size
            file_size = int(response.headers.get('content-length', 0))

            # Sanitize filename
            safe_filename = quote(f"{info['title']}.{format_info['ext']}")
            
            # Create response headers
            headers = {
                'Content-Type': response.headers.get('content-type', 'application/octet-stream'),
                'Content-Length': str(file_size),
                'Content-Disposition': f'attachment; filename="{safe_filename}"',
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }

            def generate():
                try:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            yield chunk
                except (requests.exceptions.ChunkedEncodingError, 
                        requests.exceptions.ConnectionError) as e:
                    # If there's an error, try to reconnect and continue
                    response_new = session.get(
                        download_url,
                        stream=True,
                        headers=response.request.headers,
                        timeout=30
                    )
                    for chunk in response_new.iter_content(chunk_size=8192):
                        if chunk:
                            yield chunk
                finally:
                    response.close()
                    session.close()
            # Get user ID if authenticated (optional)
            user_id = None
            try:
                token = request.cookies.get('auth_token')
                if token:
                    payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
                    user_id = payload.get('user_id')
            except:
                pass  # Continue without user_id if not authenticated
            print(user_id)
            # Record the download
            db.record_download(url, format_type, user_id)
        
            return Response(
                generate(),
                headers=headers,
                direct_passthrough=True
            )

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/download-thumbnail', methods=['GET'])
def download_thumbnail():
    try:
        thumbnail_url = request.args.get('url')
        
        if not thumbnail_url:
            return jsonify({'error': 'Thumbnail URL is required'}), 400

        # Configure session with retry strategy
        session = requests.Session()
        adapter = requests.adapters.HTTPAdapter(
            max_retries=3,
            pool_connections=10,
            pool_maxsize=10
        )
        session.mount('http://', adapter)
        session.mount('https://', adapter)
        
        # Get the thumbnail
        response = session.get(
            thumbnail_url,
            stream=True,
            timeout=10,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        )
        
        if not response.ok:
            return jsonify({'error': 'Failed to fetch thumbnail'}), 500

        # Get file size
        file_size = int(response.headers.get('content-length', 0))

        # Determine content type and extension
        content_type = response.headers.get('content-type', 'image/jpeg')
        ext = mimetypes.guess_extension(content_type) or '.jpg'
        
        # Get filename from URL or use default
        url_path = urlparse(thumbnail_url).path
        filename = os.path.basename(url_path) or f'thumbnail{ext}'
        safe_filename = quote(filename)

        # Create response headers
        headers = {
            'Content-Type': content_type,
            'Content-Length': str(file_size),
            'Content-Disposition': f'attachment; filename="{safe_filename}"',
            'Cache-Control': 'no-cache'
        }

        def generate():
            try:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        yield chunk
            finally:
                response.close()
                session.close()
        # Get user ID if authenticated (optional)
        user_id = None
        try:
            token = request.cookies.get('auth_token')
            if token:
                payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
                user_id = payload.get('user_id')
        except:
            pass  # Continue without user_id if not authenticated
        
        # Record the download
        db.record_download(thumbnail_url, "image", user_id)
        return Response(
            generate(),
            headers=headers,
            direct_passthrough=True
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/urls', methods=['POST'])
def save_url():
    try:
        data = request.get_json()
        user_id = data.get('userId')
        title = data.get('title')
        url = data.get('url')
        print(user_id)
        print(title)
        print(url)
        if not all([user_id, title, url]):
            return jsonify({'error': 'All fields are required'}), 400
            
        # Save to database
        db.execute(
            'INSERT INTO urls (user_id, title, url) VALUES (?, ?, ?)',
            (user_id, title, url)
        )
        
        return jsonify({'message': 'URL saved successfully'}), 201
        
    except Exception as e:
        print(f"Error saving URL: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/urls/<int:user_id>', methods=['GET'])
def get_user_urls(user_id):
    try:
        urls = db.query(
            'SELECT * FROM urls WHERE user_id = ? ORDER BY created_at DESC',
            (user_id,)
        )
        
        return jsonify({'urls': urls}), 200
        
    except Exception as e:
        print(f"Error fetching URLs: {str(e)}")
        return jsonify({'error': str(e)}), 500



# Services Management Routes
@app.route('/api/services', methods=['GET'])
def get_services():
    try:
        services = db.get_all_services()
        return jsonify({'services': services}), 200
    except Exception as e:
        print(f"Error fetching services: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/services', methods=['POST'])
def create_service():
    try:
        data = request.get_json()
        required_fields = ['title', 'type', 'description', 'duration', 'repetitions', 'price',"image_url"]
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        service_id = db.create_service(data)
        if service_id:
            return jsonify({'message': 'Service created successfully', 'id': service_id}), 201
        return jsonify({'error': 'Failed to create service'}), 500

    except Exception as e:
        print(f"Error creating service: {str(e)}")
        return jsonify({'error': str(e)}), 500




@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    # Define the uploads directory
    uploads_dir = os.path.join('frontend', 'uploads')
    
    # Check if the uploads directory exists, if not, create it
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir)

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(uploads_dir, filename)  # Save to the uploads directory
        file.save(file_path)
        print(file_path)
        # Return the full URL to access the image
        full_url =  'uploads/' + filename
        return jsonify({'url': full_url}), 201
@app.route('/uploads/<path:filename>', methods=['GET'])
def serve_upload(filename):
    full_path = os.path.join('uploads', filename)
    print("*****************")
    print(f"Serving file: {full_path}")
    print("Current working directory:", os.getcwd())
    if not os.path.exists(full_path):
        print("File does not exist!")
        return "File not found", 404
    return send_from_directory('uploads', filename)
@app.route('/api/services/<int:service_id>', methods=['PUT'])
def update_service(service_id):
    try:
        data = request.get_json()
        if db.update_service(service_id, data):
            return jsonify({'message': 'Service updated successfully'}), 200
        return jsonify({'error': 'Service not found'}), 404

    except Exception as e:
        print(f"Error updating service: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/services/<int:service_id>', methods=['DELETE'])
def delete_service(service_id):
    try:
        if db.delete_service(service_id):
            return jsonify({'message': 'Service deleted successfully'}), 200
        return jsonify({'error': 'Service not found'}), 404

    except Exception as e:
        print(f"Error deleting service: {str(e)}")
        return jsonify({'error': str(e)}), 500



# User Management Routes
@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        users = db.get_all_users()
        
        return jsonify({'users': users}), 200
    except Exception as e:
        print(f"Error fetching users: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user_status(user_id):
    try:
        data = request.get_json()
        new_status = data.get('status')
        if db.update_user_status(user_id, new_status):

            return jsonify({'message': 'User status updated successfully'}), 200
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        print(f"Error updating user status: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        if db.delete_user(user_id):
            return jsonify({'message': 'User deleted successfully'}), 200
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        print(f"Error deleting user: {str(e)}")
        return jsonify({'error': str(e)}), 500# User Management Routes

@app.route('/api/advertisements', methods=['GET'])
def get_advertisements():
    try:
        ads = db.get_all_advertisements()
        token = request.cookies.get('auth_token')  # Get the token from cookies
        user_id=0
        user={}
        print("TOKEN........................")
        print(token)
        if token:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            print(f"Decoded token payload: {payload}")
            user_id = payload['user_id']                  
            print("***********")
            user = db.get_user_by_id(user_id)
            print("User Admin")
            print(user)
            print(user.get("email"))
            if user.get("email","") == "admin10085@outlook.com":
                print("Admin");
                print(ads)
                return jsonify({'advertisements': ads}), 200
            
        ads = db.get_user_advertisements(user["id"])
        print(user["id"])
        print("USER")
        print(ads)
        return jsonify({"advertisements":ads}),200
    except Exception as e:
        print(f"Error fetching advertisements: {str(e)}")
        return jsonify({'error': str(e)}), 500






@app.route('/api/advertisements/<int:ad_id>/status', methods=['PUT'])
def change_advertisement_status(ad_id):
    try:
        data = request.get_json()
        status = data.get('status')
        
        if not status:
            return jsonify({'error': 'Status is required'}), 400
        
        if db.update_advertisement_status(ad_id, status):
            return jsonify({'message': 'Advertisement status updated successfully'}), 200
        return jsonify({'error': 'Advertisement not found'}), 404

    except Exception as e:
        print(f"Error changing advertisement status: {e}")
        return jsonify({'error': str(e)}), 500




@app.route('/api/advertisements/<int:ad_id>', methods=['PUT'])
def edit_advertisement(ad_id):
    try:
        data = request.form
        
        # Validate incoming data
        if not data or 'title' not in data or 'description' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Create an Advertisement instance
        advertisement = {
            "title":data.get('title'),
            "description":data.get('description'),
            "url":data.get('url'),
            "budget":data.get('budget'),
            "repetitions":data.get('repetitions'),
            "image_url":data.get('image_url'),
            "duration":data.get('duration'),
            "status":data.get('status')
        }
        
        # Update the advertisement in the database
        if db.update_advertisement(ad_id, advertisement):
            return jsonify({'message': 'Advertisement updated successfully'}), 200
        else:
            return jsonify({'error': 'Advertisement not found'}), 404
    except Exception as e:
        print(f"Error editing advertisement: {str(e)}")
        return jsonify({'error': str(e)}), 500










# Notification Management Routes
@app.route('/api/notifications', methods=['POST'])
def create_notification():
    try:
        data = request.get_json()
        required_fields = ['title', 'description', 'targetAudience']
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
            
        notification_id = db.create_notification(data)
        if notification_id:
            return jsonify({
                'message': 'تم إرسال الإشعار بنجاح',
                'id': notification_id
            }), 201
        return jsonify({'error': 'فشل في إرسال الإشعار'}), 500
        
    except Exception as e:
        print(f"Error creating notification: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    try:
        notifications = db.get_all_notifications()
        return jsonify({'notifications': notifications}), 200
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/notifications/<int:notification_id>', methods=['DELETE'])
def delete_notification(notification_id):
    try:
        if db.delete_notification(notification_id):
            return jsonify({'message': 'تم حذف الإشعار بنجاح'}), 200
        return jsonify({'error': 'الإشعار غير موجود'}), 404
    except Exception as e:
        print(f"Error deleting notification: {e}")
        return jsonify({'error': str(e)}), 500



@app.route('/api/user/notifications', methods=['GET'])
def get_user_notifications():
    try:
        # Get user_id from token
        token = request.cookies.get('auth_token')
        if not token:
            return jsonify({'error': 'Authentication required'}), 401
            
        try:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
            
        notifications = db.get_user_notifications(user_id)
        return jsonify({'notifications': notifications}), 200
        
    except Exception as e:
        print(f"Error fetching user notifications: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/notifications/<int:notification_id>/read', methods=['POST'])
def mark_notification_read(notification_id):
    try:
        # Get user_id from token
        token = request.cookies.get('auth_token')
        if not token:
            return jsonify({'error': 'Authentication required'}), 401
            
        try:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            
            user_id = payload['user_id']
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
            
        success = db.mark_notification_read(notification_id, user_id)
        if success:
            return jsonify({'message': 'Notification marked as read'}), 200
        return jsonify({'error': 'Failed to mark notification as read'}), 400
        
    except Exception as e:
        print(f"Error marking notification as read: {e}")
        return jsonify({'error': str(e)}), 500




# Subscription Management Routes
@app.route('/api/subscriptions', methods=['GET'])
def get_subscriptions():
    try:
        subscriptions = db.get_all_subscriptions()
        return jsonify({'subscriptions': subscriptions}), 200
    except Exception as e:
        print(f"Error fetching subscriptions: {e}")
        return jsonify({'error': str(e)}), 500
@app.route('/api/subscriptions', methods=['POST'])
def create_subscription():
    try:
        data = request.get_json()
        
        # First create or get the user
        try:
            with db.get_connection() as conn:
                cursor = conn.cursor()
                
                # Check if user exists
                cursor.execute("SELECT id FROM users WHERE email = ?", (data['email'],))
                user = cursor.fetchone()
                
                if user:
                    user_id = user[0]
                else:
                    # Create new user
                    cursor.execute("""
                        INSERT INTO users (email, first_name, phone, country)
                        VALUES (?, ?, ?, ?)
                    """, (
                        data['email'],
                        data['name'],
                        data['phone'],
                        data['country']
                    ))
                    user_id = cursor.lastrowid
                
                # Create subscription
                cursor.execute("""
                    INSERT INTO subscriptions (
                        user_id, type, tier, payment_method, 
                        start_date, end_date, status
                    ) VALUES (?, ?, ?, ?, ?, ?, 'active')
                """, (
                    user_id,
                    data['type'],
                    data['tier'],
                    data['payment_method'],
                    data['start_date'],
                    data['end_date']
                ))
                
                subscription_id = cursor.lastrowid
                conn.commit()
                
                return jsonify({
                    'message': 'تم إنشاء الاشتراك بنجاح',
                    'id': subscription_id
                }), 201
                
        except Exception as e:
            print(f"Database error: {e}")
            return jsonify({'error': 'خطأ في قاعدة البيانات'}), 500
            
    except Exception as e:
        print(f"Error creating subscription: {e}")
        return jsonify({'error': str(e)}), 500
@app.route('/api/subscriptions/<int:subscription_id>', methods=['PUT'])
def update_subscription(subscription_id):
    try:
        data = request.get_json()
        if db.update_subscription(subscription_id, data):
            return jsonify({'message': 'تم تحديث الاشتراك بنجاح'}), 200
        return jsonify({'error': 'الاشتراك غير موجود'}), 404
        
    except Exception as e:
        print(f"Error updating subscription: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/subscriptions/<int:subscription_id>', methods=['DELETE'])
def delete_subscription(subscription_id):
    try:
        if db.delete_subscription(subscription_id):
            return jsonify({'message': 'تم حذف الاشتراك بنجاح'}), 200
        return jsonify({'error': 'الاشتراك غير موجود'}), 404
        
    except Exception as e:
        print(f"Error deleting subscription: {e}")
        return jsonify({'error': str(e)}), 500







@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    try:
        analytics_data = db.get_analytics_data()
        return jsonify(analytics_data), 200
    except Exception as e:
        print(f"Error getting analytics: {e}")
        return jsonify({'error': str(e)}), 500










@app.route('/api/stats/downloads-by-website', methods=['GET'])
def get_downloads_by_website():
    try:
        stats = db.get_downloads_by_website()
        return jsonify(stats), 200
    except Exception as e:
        print(f"Error getting downloads by website stats: {e}")
        return jsonify({'error': str(e)}), 500




@app.route('/api/stats/downloads', methods=['GET'])
def get_download_statistics():
    try:
        stats = db.get_download_stats()
        return jsonify(stats), 200
    except Exception as e:
        print(f"Error getting download stats: {e}")
        return jsonify({'error': str(e)}), 500




@app.route('/api/completed-profiles', methods=['GET'])
def get_completed_profiles():
    try:
        completed_profiles = db.get_completed_profiles()
        return jsonify({
            'count': len(completed_profiles),
            'profiles': completed_profiles
        }), 200
    except Exception as e:
        print(f"Error fetching completed profiles: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/session', methods=['POST', 'OPTIONS'])
def handle_session():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response
        
    try:
        data = request.get_json()
        # Use dateutil.parser instead of fromisoformat
        start_time = dateutil.parser.parse(data['start_time'])
        end_time = dateutil.parser.parse(data['end_time'])
        is_authenticated = data.get('is_authenticated', False)
        
        operating_system=data.get("operating_system")
        
        success = db.record_session(
            user_id=None,  # Will be None for anonymous users
            start_time=start_time,
            end_time=end_time,
            is_authenticated=is_authenticated,
            operating_system = operating_system
        )
        
        if success:
            return jsonify({'message': 'Session recorded successfully'}), 200
        return jsonify({'error': 'Failed to record session'}), 500
        
    except Exception as e:
        print(f"Error recording session: {e}")
        return jsonify({'error': str(e)}), 500




@app.route('/api/execute-payment', methods=['POST'])
def execute_payment():
    payment_id = request.json.get('orderID')
    payer_id = request.json.get('payerID')
    print(payment_id);
    print(payer_id);
    print(request.json.get("email"))
    if not payment_id or not payer_id:
        return jsonify({"error": "Payment ID and Payer ID are required"}), 400
    try:
        user_id = db.get_user_by_email(request.json.get("email"));
        print(user_id.get("id"))
        subscription_data = {
                 'user_id': user_id.get("id"),
                 "type":request.json.get("type"),
                 "tier":request.json.get("tier"),
                'payment_method': 'PayPal',  # Save the payment method
                'start_date': datetime.now(),
                'end_date': datetime.now() + timedelta(days=1),  # Example for 30 days
            }
        db.create_subscription(user_id.get("id"),subscription_data)  # Call your DB function to create a subscription
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": "Failed to execute payment", "details": str(e)}), 500




@app.route('/api/advertisements', methods=['POST'])
def create_advertisement():
    try:
        data = request.form  # Get the form data
        user_id=data.get("user_id")
        title = data.get('title')
        description = data.get('description')
        url = data.get('url')
        budget = data.get('budget')
        repetitions = data.get('repetitions')
        
        duration = data.get('duration')
        status = data.get('status', 'pending')  # Default to 'pending' if not provided
        
        # Handle file upload if present
        file = request.files.get('file')
        image_url = None
        
        if file:

            # Save the file to the uploads directory
            filename = secure_filename(file.filename)
            uploads_dir = os.path.join('frontend', 'uploads')
            file_path = os.path.join(uploads_dir, filename)
            file.save(file_path)
            image_url = f'uploads/{filename}'  # Adjust this based on your serving path
        
        sent_data = {
            "image_url":image_url,
            "title":title,
            "description":description,
            "url":url,
            "status":status,
            "repetitions":repetitions,
            "budget":budget,
            "duration":duration,
        }
        # Insert the new advertisement into the database
        if db.create_advertisement(user_id,sent_data) :
            return jsonify({'message': 'Advertisement created successfully'}), 200
        return jsonify({'error': 'فشل في إرسال الاعلان'}), 500
        
    except Exception as e:
        print(f"Error creating advertisement: {e}")
        return jsonify({'error': 'Failed to create advertisement'}), 500



# Content Management Routes
@app.route('/api/content', methods=['GET'])
def get_content():
    try:
        content_type = request.args.get('type')  # Get the type from query parameters
        content = db.get_content_by_type(content_type)  # Fetch content based on type
        if not content_type : 
             content = db.get_all_content() 
        return jsonify({'content': content}), 200
    except Exception as e:
        print(f"Error fetching content: {str(e)}")
        return jsonify({'error': str(e)}), 500




@app.route('/api/content', methods=['POST'])
def create_content():
    try:
        data = request.get_json()
        required_fields = ['title', 'type', 'description']
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        content_id = db.create_content(data)
        if content_id:
            return jsonify({'message': 'Content created successfully', 'id': content_id}), 201
        return jsonify({'error': 'Failed to create content'}), 500

    except Exception as e:
        print(f"Error creating content: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/content/<int:content_id>', methods=['PUT'])
def update_content(content_id):
    try:
        data = request.get_json()
        if db.update_content(content_id, data):
            return jsonify({'message': 'Content updated successfully'}), 200
        return jsonify({'error': 'Content not found'}), 404

    except Exception as e:
        print(f"Error updating content: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/content/<int:content_id>', methods=['DELETE'])
def delete_content(content_id):
    try:
        if db.delete_content(content_id):
            return jsonify({'message': 'Content deleted successfully'}), 200
        return jsonify({'error': 'Content not found'}), 404

    except Exception as e:
        print(f"Error deleting content: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Server starting on http://127.0.0.1:5000")
    app.run(debug=True)