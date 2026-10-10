import os
import re
import unittest

class TestRepositoryIntegrity(unittest.TestCase):
    def setUp(self):
        self.repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        self.expected_files = ['.gitignore', 'BUGRAIDER_PROMPT_v7_PRO.md', 'LICENSE', 'README.md']

    def test_expected_files_exist(self):
        """Verify that all core files exist in repository root."""
        for filename in self.expected_files:
            filepath = os.path.join(self.repo_root, filename)
            self.assertTrue(os.path.exists(filepath), f"Missing required file: {filename}")

    def test_markdown_code_blocks_balanced(self):
        """Verify that code blocks (```) are balanced in markdown files."""
        for filename in ['BUGRAIDER_PROMPT_v7_PRO.md', 'README.md']:
            filepath = os.path.join(self.repo_root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            count = content.count('```')
            self.assertEqual(count % 2, 0, f"Unmatched code block delimiter (```) in {filename}")

    def test_markdown_local_links_exist(self):
        """Verify that all local markdown links resolve to existing files."""
        for filename in ['BUGRAIDER_PROMPT_v7_PRO.md', 'README.md', 'LICENSE']:
            filepath = os.path.join(self.repo_root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
            for text, link in links:
                if link.startswith(('http://', 'https://', '#')):
                    continue
                clean_link = link.split('#')[0]
                target_path = os.path.join(self.repo_root, clean_link)
                self.assertTrue(os.path.exists(target_path), f"Broken link in {filename}: {link}")

if __name__ == '__main__':
    unittest.main()
