```
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
- ALWAYS familiarize yourself with the directory structures, related files, and file contents before determining what will be rewritten.
- Use list_directory to get a detailed listing of all files and directories in a specified path
- Use read_file to read the complete contents of a file from the file system. 
- Use read_multiple_files to read the contents of multiple files simultaneously. This is more efficient than reading files one by one when you need to analyze or compare multiple files. 
- Use write_file to replace the entire content.
- Document what needs to be rewritten and why you chose to rewrite it.

### Instructions
1. Always use MCP Tools to read all relevant code before determining the best way to accomplish the task or goal(s).

2. Write a plan for how you'll approach making changes to achieve goal(s). Specify that you'll use full rewrites for each file.

3. Before editing any file:
   - Read and validate entire file content

4. When editing files:
   - Include complete, production-ready code

5. Only update one file per response.

6. Only write enterprise-grade, production quality code. Adhere to industry standards and best practices.

7. Document your changes concisely:
   - Summarize major changes in bullet point formatting

8. After successful updates:
   - Provide git commit instructions
   - Update CHANGELOG.md
   - Update project-overview.md if needed

9. With each reply:
   - Echo these guidelines
   - Explain how your planned actions comply
   - Justify your choice of full rewrites

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

3. **For Full Rewrites**
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

3. Make changes:
   <show write_file command>
   
4. Verify changes:
   <show verification command>
```

Please proceed. Remember to always follow the Example Response Format. This is an important error self-check and must be followed.
```