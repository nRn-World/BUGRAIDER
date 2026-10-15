import os
import re
import unittest
import urllib.parse

class TestRepositoryIntegrity(unittest.TestCase):
    def setUp(self):
        self.repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        self.expected_files = ['.gitignore', 'BUGRAIDER_PROMPT_v7_PRO.md', 'LICENSE', 'README.md', 'Screenshots', 'tests']

    def _get_all_markdown_files(self):
        """Recursively find all .md files in the repository."""
        markdown_files = []
        for root, dirs, files in os.walk(self.repo_root):
            # Prune ignored directories in-place so os.walk does not recurse into them
            dirs[:] = [d for d in dirs if d not in ('.git', '__pycache__', 'node_modules', '.venv', '.pytest_cache')]
            for file in files:
                if file.endswith('.md'):
                    markdown_files.append(os.path.join(root, file))
        return markdown_files

    def _strip_code_blocks(self, content):
        """Remove fenced code blocks from markdown content."""
        lines = content.splitlines()
        filtered_lines = []
        in_code_block = False
        active_fence = None

        for line in lines:
            match = re.match(r'^\s*(`{3,}|~{3,})', line)
            if match:
                fence_str = match.group(1)
                fence_char = fence_str[0]
                fence_len = len(fence_str)
                if not in_code_block:
                    in_code_block = True
                    active_fence = (fence_char, fence_len)
                    continue
                else:
                    if fence_char == active_fence[0] and fence_len >= active_fence[1]:
                        in_code_block = False
                        active_fence = None
                        continue
            if not in_code_block:
                filtered_lines.append(line)
        return '\n'.join(filtered_lines)

    def test_expected_files_exist(self):
        """Verify that all core files and directories exist in repository root."""
        for filename in self.expected_files:
            filepath = os.path.join(self.repo_root, filename)
            self.assertTrue(os.path.exists(filepath), f"Missing required file/directory: {filename}")

    def test_markdown_code_blocks_balanced(self):
        """Verify that code block fence markers are balanced in markdown files."""
        for filepath in self._get_all_markdown_files():
            with open(filepath, 'r', encoding='utf-8') as f:
                lines = f.readlines()

            in_code_block = False
            active_fence = None
            open_line = None

            for line_num, line in enumerate(lines, 1):
                match = re.match(r'^\s*(`{3,}|~{3,})', line)
                if match:
                    fence_str = match.group(1)
                    fence_char = fence_str[0]
                    fence_length = len(fence_str)

                    if not in_code_block:
                        in_code_block = True
                        active_fence = (fence_char, fence_length)
                        open_line = line_num
                    else:
                        if fence_char == active_fence[0] and fence_length >= active_fence[1]:
                            in_code_block = False
                            active_fence = None
                            open_line = None

            rel_path = os.path.relpath(filepath, self.repo_root)
            self.assertFalse(in_code_block, f"Unclosed code fence in {rel_path} starting at line {open_line}")

    def test_markdown_local_links_exist(self):
        """Verify that all local markdown links resolve to existing files."""
        files_to_check = self._get_all_markdown_files()
        license_path = os.path.join(self.repo_root, 'LICENSE')
        if os.path.exists(license_path) and license_path not in files_to_check:
            files_to_check.append(license_path)

        for filepath in files_to_check:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            content = self._strip_code_blocks(content)
            links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
            for text, link in links:
                raw_link = link.strip()

                # Strip surrounding angle brackets if present e.g. <./file.md> or <http://example.com>
                if raw_link.startswith('<') and raw_link.endswith('>'):
                    raw_link = raw_link[1:-1].strip()

                # Ignore remote links, scheme-relative URLs, anchor-only links, and non-http schemes (mailto:, tel:, etc.)
                if raw_link.startswith('//') or re.match(r'^(https?://|#|[a-zA-Z0-9\+\.\-]+:)', raw_link):
                    continue

                # Extract path component prior to any link title string/quotes or whitespace
                path_part = raw_link.split()[0] if raw_link.split() else raw_link
                clean_link = path_part.split('#')[0].split('?')[0]
                clean_link = urllib.parse.unquote(clean_link)
                if not clean_link:
                    continue

                if clean_link.startswith('/'):
                    target_path = os.path.join(self.repo_root, clean_link.lstrip('/'))
                else:
                    target_path = os.path.join(os.path.dirname(filepath), clean_link)

                rel_source = os.path.relpath(filepath, self.repo_root)
                self.assertTrue(os.path.exists(target_path), f"Broken link in {rel_source}: {link} -> {target_path}")

    def test_bugraider_prompt_contract(self):
        """Verify BUGRAIDER_PROMPT_v7_PRO.md contains required prompt contract sections and structures."""
        prompt_path = os.path.join(self.repo_root, 'BUGRAIDER_PROMPT_v7_PRO.md')
        with open(prompt_path, 'r', encoding='utf-8') as f:
            content = f.read()

        required_sections = [
            '🎯 Core Identity',
            '⚖️ Iron Rules',
            '🚨 Severity Model',
            '🚀 Session Flow',
            '📊 Report Contract',
            '🔧 Fix Workflow',
            '🚀 Activation Response'
        ]
        for section in required_sections:
            self.assertIn(section, content, f"Missing required prompt section: {section}")

        # Check activation string exists
        self.assertIn("BUGRAIDER v7.0 PRO — Online", content)

        # Check all 5 severities present
        severities = ['🔴 Critical', '🟠 High', '🟡 Medium', '🟢 Low', '⚪ Info']
        for sev in severities:
            self.assertIn(sev, content, f"Missing severity in prompt: {sev}")

        # Check scan modes present
        scan_modes = ['[1] QUICK', '[2] DEEP', '[3] FOCUSED', '[4] DIFF', '[5] FIX']
        for mode in scan_modes:
            self.assertIn(mode, content, f"Missing scan mode in prompt: {mode}")

        # Check language options present
        languages = ['English', 'Svenska', 'Türkçe', 'Deutsch', 'Español', 'Français']
        for lang in languages:
            self.assertIn(lang, content, f"Missing language option in prompt: {lang}")

        # Check fix workflow steps present
        fix_steps = ['Step 1 — Safety gate', 'Step 2 — Fix plan', 'Step 3 — Apply', 'Step 4 — Verification loop', 'Step 5 — Close out']
        for step in fix_steps:
            self.assertIn(step, content, f"Missing fix step in prompt: {step}")

    def test_readme_project_structure_sync(self):
        """Verify that items listed in README Project Structure actually exist in repo."""
        readme_path = os.path.join(self.repo_root, 'README.md')
        with open(readme_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Parse items dynamically from README code block in Project Structure section
        structure_match = re.search(r'## 📁 Project Structure\s+```[a-z]*\n([\s\S]*?)```', content)
        self.assertIsNotNone(structure_match, "Could not find Project Structure code block in README.md")

        structure_block = structure_match.group(1)
        # Extract items listed after tree characters e.g. "├── BUGRAIDER_PROMPT_v7_PRO.md" or "└── tests/"
        parsed_items = re.findall(r'[├└]──\s*(\S+)', structure_block)
        self.assertTrue(len(parsed_items) > 0, "No items parsed from README Project Structure block")

        for item in parsed_items:
            clean_item = item.rstrip('/')
            target_path = os.path.join(self.repo_root, clean_item)
            self.assertTrue(os.path.exists(target_path), f"README Project Structure lists non-existent item: {item}")

    def test_markdown_code_blocks_nested_fences_handling(self):
        """Verify code fence balancing logic with nested fences (e.g. 3 backticks inside 4 backticks)."""
        lines = [
            "````markdown\n",
            "Here is an inner snippet:\n",
            "```python\n",
            "print('hello world')\n",
            "```\n",
            "````\n"
        ]
        in_code_block = False
        active_fence = None
        for line in lines:
            match = re.match(r'^\s*(`{3,}|~{3,})', line)
            if match:
                fence_str = match.group(1)
                fence_char = fence_str[0]
                fence_length = len(fence_str)

                if not in_code_block:
                    in_code_block = True
                    active_fence = (fence_char, fence_length)
                else:
                    if fence_char == active_fence[0] and fence_length >= active_fence[1]:
                        in_code_block = False
                        active_fence = None

        self.assertFalse(in_code_block)

    def test_markdown_code_blocks_tilde_inside_backticks(self):
        """Verify code fence balancing logic when tilde fence is inside backtick fence and vice versa."""
        lines = [
            "````markdown\n",
            "~~~python\n",
            "print('hello')\n",
            "~~~\n",
            "````\n"
        ]
        in_code_block = False
        active_fence = None
        for line in lines:
            match = re.match(r'^\s*(`{3,}|~{3,})', line)
            if match:
                fence_str = match.group(1)
                fence_char = fence_str[0]
                fence_length = len(fence_str)

                if not in_code_block:
                    in_code_block = True
                    active_fence = (fence_char, fence_length)
                else:
                    if fence_char == active_fence[0] and fence_length >= active_fence[1]:
                        in_code_block = False
                        active_fence = None

        self.assertFalse(in_code_block)

    def test_markdown_local_links_parsing_edge_cases(self):
        """Verify link parsing helper logic handles titles, angle brackets, and scheme-relative URLs."""
        test_cases = [
            ("[prompt](./BUGRAIDER_PROMPT_v7_PRO.md \"Title\")", "./BUGRAIDER_PROMPT_v7_PRO.md"),
            ("[license](<./LICENSE>)", "./LICENSE"),
            ("[encoded](./BUGRAIDER%5FPROMPT%5Fv7%5FPRO.md)", "./BUGRAIDER_PROMPT_v7_PRO.md"),
            ("[cdn](//cdn.example.com/lib.js)", None),
            ("[http](http://example.com)", None),
            ("[anchor](#section)", None)
        ]

        for content, expected_path_part in test_cases:
            links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
            self.assertTrue(len(links) > 0)
            text, link = links[0]
            raw_link = link.strip()

            if raw_link.startswith('<') and raw_link.endswith('>'):
                raw_link = raw_link[1:-1].strip()

            if raw_link.startswith('//') or re.match(r'^(https?://|#|[a-zA-Z0-9\+\.\-]+:)', raw_link):
                self.assertIsNone(expected_path_part)
                continue

            path_part = raw_link.split()[0] if raw_link.split() else raw_link
            clean_link = path_part.split('#')[0].split('?')[0]
            clean_link = urllib.parse.unquote(clean_link)
            self.assertEqual(clean_link, expected_path_part)

if __name__ == '__main__':
    unittest.main()
