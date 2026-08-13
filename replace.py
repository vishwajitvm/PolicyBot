import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Check if this file has datetime.utcnow or datetime.now
    if not ('utcnow' in content or 'now' in content):
        return
        
    # We want to replace:
    # datetime.utcnow() -> get_current_time()
    # datetime.now(UTC) -> get_current_time()
    # datetime.now(timezone.utc) -> get_current_time()
    # Field(default_factory=datetime.utcnow) -> Field(default_factory=get_current_time)

    # First add import if we need to replace something
    replacements_made = False
    
    new_content = re.sub(r'datetime\.utcnow\(\)', 'get_current_time()', content)
    new_content = re.sub(r'datetime\.now\(UTC\)', 'get_current_time()', new_content)
    new_content = re.sub(r'datetime\.now\(timezone\.utc\)', 'get_current_time()', new_content)
    new_content = re.sub(r'Field\(default_factory=datetime\.utcnow\)', 'Field(default_factory=get_current_time)', new_content)
    
    if new_content != original:
        # Add import at top
        if 'from app.core.time import get_current_time' not in new_content:
            new_content = 'from app.core.time import get_current_time\n' + new_content
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('c:/python/policybot/backend'):
    for file in files:
        if file.endswith('.py') and file != 'time.py':
            process_file(os.path.join(root, file))
