import os
import zipfile

def zipdir(path, ziph):
    for root, dirs, files in os.walk(path):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, os.path.join(path, '..'))
            ziph.write(full_path, rel_path)

os.makedirs('public', exist_ok=True)
zip_output = 'public/ReelCounter-Android-Project.zip'
with zipfile.ZipFile(zip_output, 'w', zipfile.ZIP_DEFLATED) as zipf:
    zipdir('android-project', zipf)

print(f"Archive successfully created: {zip_output} ({os.path.getsize(zip_output)} bytes)")
