from PIL import Image
import os

img_path = r'C:\Users\elcra\.gemini\antigravity\brain\61d31951-629b-4278-9e69-3570caa64e24\.user_uploaded\media_1787172738659.png'
if os.path.exists(img_path):
    img = Image.open(img_path)
    
    width, height = img.size
    
    left = int(width * 0.52)
    top = 0
    right = width
    bottom = height
    
    cropped = img.crop((left, top, right, bottom))
    cropped.save(r'c:\Users\elcra\Desktop\MP\images\laptop-light.png')
    print("Cropped image saved successfully to images/laptop-light.png")
else:
    print("Image not found")
