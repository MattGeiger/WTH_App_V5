Using MCP please explore:
- the project path: /Users/russbook/Desktop/wth_app_clean
- README.md
- CHANGELOG.md

Here's what I aim to do:
[Your goal here]

### Context
We are going to [debug,improve,add]. While collaborating, please follow these guidelines:

### Plan
Create a new branch for staging these changes. Implement in steps:

Step 1: ...
Step 2: ...

### File Editing Guidelines
1. For small, targeted changes (editing a few lines):
   - Use get_text_file_contents to fetch only the specific lines you need to modify
   - Use edit_text_file_contents with precise line ranges
   - Always edit from bottom to top when making multiple changes
   - For appends, use total_lines + 1 as the line_start

2. For large-scale changes (modifying >50% of file):
   - Use write_file to replace the entire content
   - Document why you chose to rewrite instead of edit

### Instructions
1. Always use MCP Tools to read all relevant code before determining the best way to accomplish the task or goal(s).

2. Write a plan for how you'll approach making changes to achieve goal(s). Specify whether you'll use targeted edits or full rewrites for each file.

3. Before editing any file:
   - For targeted edits: Get specific line ranges and hashes
   - For full rewrites: Read and validate entire file content

4. When editing files:
   - For targeted edits: Make precise line-range modifications
   - For full rewrites: Include complete, production-ready code

5. Only update one file per response.

6. Only write enterprise-grade, production quality code. Adhere to industry standards and best practices.

7. Document your changes concisely:
   - For targeted edits: List modified line ranges and their purpose
   - For full rewrites: Summarize major changes

8. After successful updates:
   - Provide git commit instructions
   - Update CHANGELOG.md
   - Update project-overview.md if needed

9. With each reply:
   - Echo these guidelines
   - Explain how your planned actions comply
   - Justify your choice between targeted edits vs full rewrites

Before we begin, let's create a new branch and sync it to remote.

In VS Code Terminal, this is the current state:
[Your terminal state here]

### Example Response Format

After each instruction from me, your response should follow this structure:

1. **Guidelines Echo**
[Guidelines from above listed here.]
"I acknowledge the file editing guidelines and will proceed according to the instructions..."

2. **Analysis of the Problem**
"The error occurs because..."

3. **Edit Strategy Declaration**
"For this task, I will use [MCP server: text-editor with get_text_file_contentsm(read text file contents from multiple files and line ranges.), and edit_text_file_contents (a line editor that supports editing text file contents by specifying line ranges and content)]. / [full rewrite with MCP server: read_multiple_files and/or read_file with write_file (create a new file or completely overwrite an existing file with new content).] because [justification based on scope of changes]"

4a. **For Targeted Edits**
```
Files to modify:
- example.js
  - Lines 45-48: Update error handling
  - Lines 120-125: Add new validation
  - Append: Add new utility function
Approach: Bottom-up editing to maintain line numbers
```

4b. **For Full Rewrites**
```
Files to modify:
- example.js
Justification for full rewrite:
- Restructuring >60% of file
- Multiple interdependent changes
- Significant refactoring needed
```

5. **Implementation Steps**
```
1. Read current content:
   <show MCP tool command>
   
2. [For targeted edits] Get specific line hashes:
   <show get_text_file_contents command>
   
3. Make changes:
   <show edit_text_file_contents or write_file command>
   
4. Verify changes:
   <show verification command>
```

Please proceed. Remember to always follow the Example Response Format. This is an important error self-check and must be followed.