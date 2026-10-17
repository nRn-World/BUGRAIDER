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

    def _find_unclosed_code_fences(self, lines):
        """Analyze lines of Markdown for unclosed code block fences and return fence stack."""
        fence_stack = []
        for line_num, line in enumerate(lines, 1):
            match = re.match(r'^\s*(`{3,}|~{3,})', line)
            if match:
                fence_str = match.group(1)
                fence_char = fence_str[0]
                fence_length = len(fence_str)

                if fence_stack:
                    active_char, active_length, _ = fence_stack[-1]
                    if fence_char == active_char and fence_length >= active_length:
                        fence_stack.pop()
                else:
                    fence_stack.append((fence_char, fence_length, line_num))
        return fence_stack

    def _parse_local_link(self, raw_link):
        """Parse a markdown link target and return the clean local path part, or None if remote/ignored."""
        raw_link = raw_link.strip()
        if raw_link.startswith('<') and raw_link.endswith('>'):
            raw_link = raw_link[1:-1].strip()

        # Ignore remote links, scheme-relative URLs, anchor-only links, and non-http schemes
        if raw_link.startswith('//') or re.match(r'^(https?://|#|[a-zA-Z0-9\+\.\-]+:)', raw_link):
            return None

        # Extract path component prior to any link title string/quotes or whitespace
        path_part = raw_link.split()[0] if raw_link.split() else raw_link
        clean_link = path_part.split('#')[0].split('?')[0]
        clean_link = urllib.parse.unquote(clean_link)
        return clean_link if clean_link else None

    def _strip_code_blocks(self, content):
        """Remove fenced code blocks from markdown content."""
        lines = content.splitlines()
        filtered_lines = []
        fence_stack = []

        for line in lines:
            match = re.match(r'^\s*(`{3,}|~{3,})', line)
            if match:
                fence_str = match.group(1)
                fence_char = fence_str[0]
                fence_length = len(fence_str)

                if fence_stack:
                    active_char, active_length = fence_stack[-1]
                    if fence_char == active_char and fence_length >= active_length:
                        fence_stack.pop()
                else:
                    fence_stack.append((fence_char, fence_length))
                continue

            if not fence_stack:
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

            fence_stack = self._find_unclosed_code_fences(lines)
            rel_path = os.path.relpath(filepath, self.repo_root)
            self.assertEqual(len(fence_stack), 0, f"Unclosed code fence in {rel_path} starting at line {fence_stack[0][2] if fence_stack else 'N/A'}")

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
                clean_link = self._parse_local_link(link)
                if not clean_link:
                    continue

                if clean_link.startswith('/'):
                    target_path = os.path.join(self.repo_root, clean_link.lstrip('/'))
                else:
                    target_path = os.path.join(os.path.dirname(filepath), clean_link)

                rel_source = os.path.relpath(filepath, self.repo_root)
                self.assertTrue(os.path.exists(target_path), f"Broken link in {rel_source}: {link} -> {target_path}")

    def test_bugraider_prompt_contract(self):
        """Verify BUGRAIDER_PROMPT_v7_PRO.md contains required prompt contract sections, phases, and rules."""
        prompt_path = os.path.join(self.repo_root, 'BUGRAIDER_PROMPT_v7_PRO.md')
        with open(prompt_path, 'r', encoding='utf-8') as f:
            content = f.read()

        required_sections = [
            '🎯 Core Identity',
            '⚖️ Iron Rules',
            '🚨 Severity Model',
            '🎚️ Confidence Protocol',
            '🚀 Session Flow',
            '📊 Report Contract',
            '🔧 Fix Workflow',
            '🧯 False Positive Guardrails',
            '🔒 Secret Handling',
            '🎯 Diff / Regression Mode',
            '🌐 Localization',
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

        # Check all 6 session phases present
        phases = [
            'Phase 0 — Setup',
            'Phase 1 — Project Mapping',
            'Phase 2 — Audit Strategy',
            'Phase 3 — File Review',
            'Phase 4 — Cross-File Review',
            'Phase 5 — Verification Pass'
        ]
        for phase in phases:
            self.assertIn(phase, content, f"Missing session phase in prompt: {phase}")

        # Check all 5 fix steps present
        fix_steps = [
            'Step 1 — Safety gate',
            'Step 2 — Fix plan',
            'Step 3 — Apply',
            'Step 4 — Verification loop',
            'Step 5 — Close out'
        ]
        for step in fix_steps:
            self.assertIn(step, content, f"Missing fix workflow step in prompt: {step}")

        # Check that Iron Rules has 12 numbered rules
        iron_rules_match = re.search(r'##\s*⚖️\s*Iron Rules.*?\n(1\..*?)(?=\n##|\Z)', content, re.DOTALL)
        self.assertIsNotNone(iron_rules_match, "Could not find Iron Rules section in prompt")
        rules_text = iron_rules_match.group(1)
        rule_numbers = re.findall(r'^\s*(\d+)\.', rules_text, re.MULTILINE)
        self.assertEqual(len(rule_numbers), 12, f"Expected 12 Iron Rules, found {len(rule_numbers)}")

    def test_readme_project_structure_sync(self):
        """Verify that items listed in README Project Structure section dynamically match files on disk."""
        readme_path = os.path.join(self.repo_root, 'README.md')
        with open(readme_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find Project Structure section
        structure_match = re.search(r'##\s*📁\s*Project Structure\s*```[^\n]*\n(.*?)```', content, re.DOTALL)
        self.assertIsNotNone(structure_match, "Could not find Project Structure section code block in README.md")

        block_text = structure_match.group(1)
        # Match lines like: ├── BUGRAIDER_PROMPT_v7_PRO.md  🚀 Main prompt file or └── tests/ 🧪 Unit tests
        raw_items = re.findall(r'[├└]──\s*([^\s]+)', block_text)
        self.assertGreater(len(raw_items), 0, "No items parsed from README Project Structure block")

        for item in raw_items:
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
        fence_stack = self._find_unclosed_code_fences(lines)
        self.assertEqual(len(fence_stack), 0)

    def test_markdown_code_blocks_tilde_inside_backticks(self):
        """Verify code fence balancing logic when tilde fence is inside backtick fence and vice versa."""
        lines = [
            "````markdown\n",
            "~~~python\n",
            "print('hello')\n",
            "~~~\n",
            "````\n"
        ]
        fence_stack = self._find_unclosed_code_fences(lines)
        self.assertEqual(len(fence_stack), 0)

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
            clean_link = self._parse_local_link(link)
            self.assertEqual(clean_link, expected_path_part)

if __name__ == '__main__':
    unittest.main()
