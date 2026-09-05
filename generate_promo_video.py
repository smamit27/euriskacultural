import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio

WIDTH = 1920
HEIGHT = 1080
FPS = 24
TOTAL_DURATION = 60 # seconds
TOTAL_FRAMES = FPS * TOTAL_DURATION # 1440 frames

OUTPUT_PATH = "/Users/sweta/Amit_Development/Euriska_Cultrual/euriska_cultural_launch_video.mp4"
PUBLIC_OUTPUT = "/Users/sweta/Amit_Development/Euriska_Cultrual/public/euriska_cultural_launch_video.mp4"

# Assets
ASSETS_DIR = "/Users/sweta/Amit_Development/Euriska_Cultrual/public"
ARTIFACTS_DIR = "/Users/sweta/.gemini/antigravity-ide/brain/d73c3b4b-6aec-4976-9e62-2738e3789299"

logo_path = os.path.join(ASSETS_DIR, "euriska_logo.png")
ganesh_path = os.path.join(ASSETS_DIR, "ganesh_bhagwan.jpg")
murti_path = os.path.join(ASSETS_DIR, "ganesh_murti_sponsor.jpg")
decor_path = os.path.join(ASSETS_DIR, "dagdusheth_decoration.jpg")

prasad_ui_path = os.path.join(ARTIFACTS_DIR, "prasad_seva_schedule_1788581875582.png")
kalakriti_ui_path = os.path.join(ARTIFACTS_DIR, "kalakriti_talent_matrix_1788582016561.png")
sponsors_ui_path = os.path.join(ARTIFACTS_DIR, "sponsors_seva_patrons_1788582081913.png")
calendar_ui_path = os.path.join(ARTIFACTS_DIR, "cultural_calendar_1788582175016.png")

def load_img(path, size=None):
    if os.path.exists(path):
        img = Image.open(path).convert("RGBA")
        if size:
            img = img.resize(size, Image.Resampling.LANCZOS)
        return img
    return None

logo_img = load_img(logo_path)
ganesh_img = load_img(ganesh_path)
murti_img = load_img(murti_path)
decor_img = load_img(decor_path)

prasad_ui = load_img(prasad_ui_path)
kalakriti_ui = load_img(kalakriti_ui_path)
sponsors_ui = load_img(sponsors_ui_path)
calendar_ui = load_img(calendar_ui_path)

# Fonts
font_bold_title = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 64)
font_large_quote = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia Bold.ttf", 52)
font_medium_quote = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia Bold.ttf", 40)
font_sub = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 32)
font_body = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 26)
font_badge = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 24)
font_url = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 46)

# Generate particles
np.random.seed(42)
NUM_PARTICLES = 60
particles = []
for _ in range(NUM_PARTICLES):
    particles.append({
        'x': np.random.uniform(0, WIDTH),
        'y': np.random.uniform(0, HEIGHT),
        'speed_y': np.random.uniform(0.5, 2.5),
        'speed_x': np.random.uniform(-0.5, 0.5),
        'size': np.random.uniform(3, 8),
        'alpha': np.random.uniform(80, 220),
        'color': (255, np.random.randint(180, 230), np.random.randint(50, 150))
    })

def create_gradient_bg(color_top, color_bottom):
    base = Image.new("RGBA", (WIDTH, HEIGHT), color_top)
    top_r, top_g, top_b = color_top[:3]
    bot_r, bot_g, bot_b = color_bottom[:3]
    
    # Gradient array
    grad = np.zeros((HEIGHT, WIDTH, 4), dtype=np.uint8)
    for y in range(HEIGHT):
        ratio = y / float(HEIGHT)
        r = int(top_r + (bot_r - top_r) * ratio)
        g = int(top_g + (bot_g - top_g) * ratio)
        b = int(top_b + (bot_b - top_b) * ratio)
        grad[y, :, 0] = r
        grad[y, :, 1] = g
        grad[y, :, 2] = b
        grad[y, :, 3] = 255
    return Image.fromarray(grad, "RGBA")

bg_scene1 = create_gradient_bg((20, 10, 4, 255), (45, 18, 5, 255))
bg_scene2 = create_gradient_bg((35, 12, 10, 255), (70, 25, 15, 255))
bg_scene3 = create_gradient_bg((15, 12, 35, 255), (30, 27, 75, 255))
bg_scene4 = create_gradient_bg((10, 15, 30, 255), (20, 28, 50, 255))
bg_scene5 = create_gradient_bg((30, 14, 5, 255), (65, 25, 8, 255))
bg_scene6 = create_gradient_bg((15, 12, 35, 255), (45, 20, 10, 255))

def draw_particles(frame_img, frame_idx):
    draw = ImageDraw.Draw(frame_img, "RGBA")
    for p in particles:
        py = (p['y'] + frame_idx * p['speed_y']) % HEIGHT
        px = (p['x'] + math.sin(frame_idx * 0.05 + p['x']) * 15) % WIDTH
        r, g, b = p['color']
        alpha = int(p['alpha'] * (0.6 + 0.4 * math.sin(frame_idx * 0.1 + p['y'])))
        radius = p['size']
        draw.ellipse([px - radius, py - radius, px + radius, py + radius], fill=(r, g, b, alpha))

def draw_centered_text(draw, text, font, y, color=(255, 255, 255, 255), shadow_color=(0, 0, 0, 180)):
    bbox = font.getbbox(text)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (WIDTH - text_w) // 2
    if shadow_color:
        draw.text((x + 2, y + 2), text, font=font, fill=shadow_color)
    draw.text((x, y), text, font=font, fill=color)
    return text_h

def render_frame(t, frame_idx):
    # Determine scene based on time t (0 to 60)
    # Scene 1: 0 to 7
    # Scene 2: 7 to 15
    # Scene 3: 15 to 21
    # Scene 4: 21 to 42
    # Scene 5: 42 to 51
    # Scene 6: 51 to 60
    
    if t < 7:
        # Scene 1: Opening / Diya Lighting (0:00–0:07)
        img = bg_scene1.copy()
        draw = ImageDraw.Draw(img, "RGBA")
        draw_particles(img, frame_idx)
        
        # Diya / Ganesh visual in center with glowing aura
        glow_pulse = 0.5 + 0.5 * math.sin(t * 3)
        glow_radius = int(140 + 30 * glow_pulse)
        center_x, center_y = WIDTH // 2, 420
        
        # Golden halo
        draw.ellipse([center_x - glow_radius - 20, center_y - glow_radius - 20,
                      center_x + glow_radius + 20, center_y + glow_radius + 20],
                     fill=(251, 191, 36, int(40 + 20 * glow_pulse)))
        draw.ellipse([center_x - glow_radius, center_y - glow_radius,
                      center_x + glow_radius, center_y + glow_radius],
                     fill=(245, 158, 11, int(60 + 30 * glow_pulse)))
        
        if ganesh_img:
            g_size = 200
            g_thumb = ganesh_img.resize((g_size, g_size), Image.Resampling.LANCZOS)
            # Make circle mask
            mask = Image.new("L", (g_size, g_size), 0)
            ImageDraw.Draw(mask).ellipse([0, 0, g_size, g_size], fill=255)
            img.paste(g_thumb, (center_x - g_size // 2, center_y - g_size // 2), mask)
            # Border ring
            draw.ellipse([center_x - g_size // 2, center_y - g_size // 2,
                          center_x + g_size // 2, center_y + g_size // 2],
                         outline=(253, 224, 71, 240), width=4)
        
        # Scene 1 Typography
        draw_centered_text(draw, "ॐ श्री गणेशाय नमः", font_sub, 160, color=(253, 224, 71, 230))
        draw_centered_text(draw, "EURISKA CULTURAL & FESTIVE UTSAV 2026–27", font_badge, 210, color=(254, 215, 170, 200))
        
        # Quote
        draw_centered_text(draw, "“Our culture brings us together.”", font_large_quote, 650, color=(255, 255, 255, 255))
        draw_centered_text(draw, "Majestique Euriska • 231+ Families • 6 Grand Festivals", font_sub, 740, color=(254, 215, 170, 220))
        
    elif t < 15:
        # Scene 2: Cultural Celebrations & Dhol-Tasha Montage (0:07–0:15)
        img = bg_scene2.copy()
        draw = ImageDraw.Draw(img, "RGBA")
        draw_particles(img, frame_idx)
        
        draw_centered_text(draw, "CELEBRATING TRADITIONS & HERITAGE", font_sub, 120, color=(253, 224, 71, 230))
        draw_centered_text(draw, "“Every festival has a story.", font_large_quote, 200, color=(255, 255, 255, 255))
        draw_centered_text(draw, "Every celebration creates a memory.”", font_large_quote, 270, color=(254, 240, 138, 255))
        
        # 6 Festival Showcase Cards
        festivals = [
            ("🐘 Ganesh Chaturthi", "14–25 Sep 2026", "#ea580c", "#fff7ed"),
            ("💃 Sharad Navratri", "11–20 Oct 2026", "#d97706", "#fef3c7"),
            ("🪔 Grand Diwali", "08 Nov 2026", "#7c3aed", "#faf5ff"),
            ("🎄 Christmas Fest", "25 Dec 2026", "#059669", "#ecfdf5"),
            ("🌙 Eid al-Fitr", "10 Mar 2027", "#0284c7", "#f0f9ff"),
            ("🎨 Holi Utsav", "21–22 Mar 2027", "#db2777", "#fdf2f8"),
        ]
        
        grid_w, grid_h = 440, 100
        start_x = (WIDTH - (3 * grid_w + 2 * 30)) // 2
        start_y = 400
        
        for idx, (fname, fdate, fcolor, fbg) in enumerate(festivals):
            row = idx // 3
            col = idx % 3
            bx = start_x + col * (grid_w + 30)
            by = start_y + row * (grid_h + 30)
            
            # Card Box
            draw.rounded_rectangle([bx, by, bx + grid_w, by + grid_h], radius=16,
                                  fill=(15, 23, 42, 210), outline=(253, 224, 71, 140), width=2)
            
            # Card text
            draw.text((bx + 20, by + 18), fname, font=font_sub, fill=(255, 255, 255, 255))
            draw.text((bx + 20, by + 58), f"📅 {fdate}", font=font_body, fill=(254, 215, 170, 230))
        
        draw_centered_text(draw, "✨ Connecting neighbors, building friendships, creating lifelong festive memories ✨", font_body, 780, color=(254, 215, 170, 200))
        
    elif t < 21:
        # Scene 3: Identity Reveal (0:15–0:21)
        img = bg_scene3.copy()
        draw = ImageDraw.Draw(img, "RGBA")
        draw_particles(img, frame_idx)
        
        # Center Logo with Radiant Aura
        center_x, center_y = WIDTH // 2, 380
        pulse = 0.5 + 0.5 * math.sin(t * 4)
        glow_r = int(160 + 25 * pulse)
        
        draw.ellipse([center_x - glow_r, center_y - glow_r, center_x + glow_r, center_y + glow_r],
                     fill=(249, 115, 22, int(60 + 30 * pulse)))
        
        if logo_img:
            l_w, l_h = 240, 240
            l_thumb = logo_img.resize((l_w, l_h), Image.Resampling.LANCZOS)
            # Rounded rect background
            draw.rounded_rectangle([center_x - l_w//2 - 12, center_y - l_h//2 - 12,
                                    center_x + l_w//2 + 12, center_y + l_h//2 + 12],
                                   radius=24, fill=(255, 255, 255, 255), outline=(253, 224, 71, 255), width=3)
            img.paste(l_thumb, (center_x - l_w//2, center_y - l_h//2), l_thumb)
        
        # Reveal Titles
        draw_centered_text(draw, "EURISKA CULTURAL", font_bold_title, 570, color=(255, 255, 255, 255))
        draw_centered_text(draw, "“Celebrating Togetherness.”", font_large_quote, 660, color=(254, 240, 138, 255))
        draw_centered_text(draw, "Official Community & Festival Digital Platform 2026–27", font_sub, 750, color=(224, 231, 255, 220))
        
    elif t < 42:
        # Scene 4: Platform & UI Showcase (0:21–0:42)
        # Sub-sections (5.25s each)
        sub_t = t - 21 # 0 to 21
        stage = int(sub_t / 5.25)
        
        img = bg_scene4.copy()
        draw = ImageDraw.Draw(img, "RGBA")
        draw_particles(img, frame_idx)
        
        draw_centered_text(draw, "“Discover festivals. Explore events. Experience traditions. And celebrate together.”", font_medium_quote, 70, color=(254, 240, 138, 255))
        
        if stage == 0:
            # 1. Ganesh Utsav Schedule & Milestones
            draw_centered_text(draw, "🚩 FEATURE 1: 12-DAY GANESH FESTIVAL MILESTONES & TIMELINE", font_sub, 140, color=(255, 255, 255, 255))
            if calendar_ui:
                c_w, c_h = 1300, 620
                c_thumb = calendar_ui.resize((c_w, c_h), Image.Resampling.LANCZOS)
                draw.rounded_rectangle([(WIDTH - c_w)//2 - 6, 210 - 6, (WIDTH + c_w)//2 + 6, 210 + c_h + 6], radius=16, fill=(0,0,0,100), outline=(249, 115, 22, 200), width=3)
                img.paste(c_thumb, ((WIDTH - c_w)//2, 210))
            draw_centered_text(draw, "14 Sep Aagman • Daily 8 PM Aarti • 19-20 Sep Kalakriti • 24 Sep Maha Prasad • 25 Sep Visarjan", font_body, 870, color=(254, 215, 170, 230))
            
        elif stage == 1:
            # 2. Prasad Seva Booking & Aarti Passes
            draw_centered_text(draw, "🪔 FEATURE 2: PRASAD SEVA BOOKINGS & INSTANT DIGITAL PASSES", font_sub, 140, color=(255, 255, 255, 255))
            if prasad_ui:
                p_w, p_h = 1300, 620
                p_thumb = prasad_ui.resize((p_w, p_h), Image.Resampling.LANCZOS)
                draw.rounded_rectangle([(WIDTH - p_w)//2 - 6, 210 - 6, (WIDTH + p_w)//2 + 6, 210 + p_h + 6], radius=16, fill=(0,0,0,100), outline=(234, 88, 12, 200), width=3)
                img.paste(p_thumb, ((WIDTH - p_w)//2, 210))
            draw_centered_text(draw, "Book 8 PM Daily Aarti Slots • Generate Devotee PDF Passes • Real-time Slot Transparency", font_body, 870, color=(254, 215, 170, 230))
            
        elif stage == 2:
            # 3. Kalakriti Talent Matrix
            draw_centered_text(draw, "🎨 FEATURE 3: KALAKRITI TALENT MATRIX & PARTICIPANT ROSTER", font_sub, 140, color=(255, 255, 255, 255))
            if kalakriti_ui:
                k_w, k_h = 1300, 620
                k_thumb = kalakriti_ui.resize((k_w, k_h), Image.Resampling.LANCZOS)
                draw.rounded_rectangle([(WIDTH - k_w)//2 - 6, 210 - 6, (WIDTH + k_w)//2 + 6, 210 + k_h + 6], radius=16, fill=(0,0,0,100), outline=(124, 58, 237, 200), width=3)
                img.paste(k_thumb, ((WIDTH - k_w)//2, 210))
            draw_centered_text(draw, "Drawing • Skit & Drama • Dance Extravaganza • Singing • Fashion Show • Fancy Dress", font_body, 870, color=(254, 215, 170, 230))
            
        else:
            # 4. Sponsors & Seva Patrons
            draw_centered_text(draw, "👑 FEATURE 4: SEVA PATRONS SHOWCASE & PDF CERTIFICATES", font_sub, 140, color=(255, 255, 255, 255))
            if sponsors_ui:
                s_w, s_h = 1300, 620
                s_thumb = sponsors_ui.resize((s_w, s_h), Image.Resampling.LANCZOS)
                draw.rounded_rectangle([(WIDTH - s_w)//2 - 6, 210 - 6, (WIDTH + s_w)//2 + 6, 210 + s_h + 6], radius=16, fill=(0,0,0,100), outline=(16, 185, 129, 200), width=3)
                img.paste(s_thumb, ((WIDTH - s_w)//2, 210))
            draw_centered_text(draw, "50% Murti Seva (B-307) • 50% Decor Seva (A-505) • Official Certificates • Devotee Gratitude", font_body, 870, color=(254, 215, 170, 230))
            
    elif t < 51:
        # Scene 5: Ganpati Mandap Celebration (0:42–0:51)
        img = bg_scene5.copy()
        draw = ImageDraw.Draw(img, "RGBA")
        draw_particles(img, frame_idx)
        
        draw_centered_text(draw, "DIVINE CELEBRATION & MANDAP DARSHAN", font_sub, 100, color=(253, 224, 71, 240))
        draw_centered_text(draw, "“Because culture isn’t just something we remember…", font_large_quote, 170, color=(255, 255, 255, 255))
        draw_centered_text(draw, "it’s something we celebrate together.”", font_large_quote, 240, color=(254, 240, 138, 255))
        
        # 50% - 50% Dual Side-by-Side Images
        card_w, card_h = 600, 400
        y_pos = 350
        gap = 40
        x_left = (WIDTH - (2 * card_w + gap)) // 2
        x_right = x_left + card_w + gap
        
        # Left Image: Murti
        if murti_img:
            m_thumb = murti_img.resize((card_w, card_h), Image.Resampling.LANCZOS)
            draw.rounded_rectangle([x_left - 4, y_pos - 4, x_left + card_w + 4, y_pos + card_h + 4], radius=20, fill=(0,0,0,150), outline=(249, 115, 22, 240), width=3)
            img.paste(m_thumb, (x_left, y_pos))
            # Label
            draw.rounded_rectangle([x_left + 16, y_pos + card_h - 60, x_left + card_w - 16, y_pos + card_h - 16], radius=10, fill=(15, 23, 42, 220))
            draw.text((x_left + 28, y_pos + card_h - 52), "🌺 Sacred Shri Ganesh Murti Seva", font=font_body, fill=(254, 215, 170, 255))
        
        # Right Image: Mandap Decor
        if decor_img:
            d_thumb = decor_img.resize((card_w, card_h), Image.Resampling.LANCZOS)
            draw.rounded_rectangle([x_right - 4, y_pos - 4, x_right + card_w + 4, y_pos + card_h + 4], radius=20, fill=(0,0,0,150), outline=(253, 224, 71, 240), width=3)
            img.paste(d_thumb, (x_right, y_pos))
            # Label
            draw.rounded_rectangle([x_right + 16, y_pos + card_h - 60, x_right + card_w - 16, y_pos + card_h - 16], radius=10, fill=(15, 23, 42, 220))
            draw.text((x_right + 28, y_pos + card_h - 52), "✨ Grand Mandap & Illumination Seva", font=font_body, fill=(254, 215, 170, 255))
            
        draw_centered_text(draw, "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥", font_sub, 820, color=(253, 224, 71, 230))
        draw_centered_text(draw, "GANPATI BAPPA MORYA! • MAJESTIQUE EURISKA 2026", font_body, 880, color=(255, 255, 255, 220))
        
    else:
        # Scene 6: Closing & Website Link (0:51–1:00)
        img = bg_scene6.copy()
        draw = ImageDraw.Draw(img, "RGBA")
        draw_particles(img, frame_idx)
        
        center_x, center_y = WIDTH // 2, 280
        
        # Glowing Logo
        if logo_img:
            l_w, l_h = 180, 180
            l_thumb = logo_img.resize((l_w, l_h), Image.Resampling.LANCZOS)
            draw.rounded_rectangle([center_x - l_w//2 - 8, center_y - l_h//2 - 8,
                                    center_x + l_w//2 + 8, center_y + l_h//2 + 8],
                                   radius=20, fill=(255, 255, 255, 255), outline=(253, 224, 71, 255), width=3)
            img.paste(l_thumb, (center_x - l_w//2, center_y - l_h//2), l_thumb)
            
        draw_centered_text(draw, "EURISKA CULTURAL", font_bold_title, 420, color=(255, 255, 255, 255))
        draw_centered_text(draw, "“Celebrating Togetherness.”", font_large_quote, 510, color=(254, 240, 138, 255))
        
        # Website CTA Box
        cta_w, cta_h = 900, 120
        cta_x = (WIDTH - cta_w) // 2
        cta_y = 620
        
        pulse_btn = 0.5 + 0.5 * math.sin(t * 5)
        btn_glow = int(180 + 75 * pulse_btn)
        
        draw.rounded_rectangle([cta_x - 4, cta_y - 4, cta_x + cta_w + 4, cta_y + cta_h + 4],
                               radius=24, fill=(249, 115, 22, 100), outline=(253, 224, 71, btn_glow), width=4)
        draw.rounded_rectangle([cta_x, cta_y, cta_x + cta_w, cta_y + cta_h],
                               radius=20, fill=(15, 23, 42, 240))
        
        draw_centered_text(draw, "🌐 Discover, celebrate, connect at:", font_body, cta_y + 16, color=(254, 215, 170, 230))
        draw_centered_text(draw, "euriskacultural.web.app", font_url, cta_y + 54, color=(253, 224, 71, 255))
        
        draw_centered_text(draw, "Scan QR Code • Book Aarti Slots • Register Kalakriti • View Live Reports", font_body, 790, color=(226, 232, 240, 220))
        draw_centered_text(draw, "Majestique Euriska Cultural & Festive Committee 2026–27", font_badge, 850, color=(203, 213, 225, 180))
        
    return img.convert("RGB")

print("Starting 60-Second 1080p Video Generation...")
print(f"Total frames: {TOTAL_FRAMES} @ {FPS} fps")

writer = imageio.get_writer(
    OUTPUT_PATH,
    fps=FPS,
    codec="libx264",
    quality=8,
    pixelformat="yuv420p",
    macro_block_size=1
)

for f in range(TOTAL_FRAMES):
    time_sec = f / float(FPS)
    if f % 120 == 0:
        print(f"Rendering frame {f}/{TOTAL_FRAMES} ({time_sec:.1f}s / {TOTAL_DURATION}s)...")
    frame = render_frame(time_sec, f)
    writer.append_data(np.array(frame))

writer.close()
print("Video encoding completed!")

import shutil
shutil.copyfile(OUTPUT_PATH, PUBLIC_OUTPUT)
file_size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
print(f"60-Second Video successfully generated at: {OUTPUT_PATH} ({file_size_mb:.2f} MB)")
