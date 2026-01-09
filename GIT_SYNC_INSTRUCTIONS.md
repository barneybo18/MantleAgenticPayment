# How to Update Your Code (Beginner Friendly)

Since the `main` branch has been updated online, you need to "pull" those changes to your computer so we are both working on the same version.

Follow these simple steps in your VS Code terminal.

### Step 1: Check your current status
First, check if you have any work currently in progress that hasn't been saved to git.
```bash
git status
```

### Step 2: Update your code

**Scenario A: "git status" said "nothing to commit, working tree clean"**
This means you are ready to update immediately. Just run:
```bash
git pull origin main
```
*   If it updates successfully, you are done!
*   If it opens a text editor (vim/nano), just press `Ctrl+X` to exit (or typed `:q!` and Enter).

---

**Scenario B: "git status" showed red files (Unsaved changes)**
You have work on your computer that isn't saved yet. Git won't let you update because it doesn't want to overwrite your work.

1.  **Save your work specifically to a temporary storage area (Stash):**
    ```bash
    git stash
    ```
    *(Your changes will disappear from the screen - don't panic! They are safe.)*

2.  **Download the updates:**
    ```bash
    git pull origin main
    ```

3.  **Bring your work back:**
    ```bash
    git stash pop
    ```
    *(Now your changes are back on top of the new updates!)*

---

### Step 3: Troubleshooting

If you see an error about **"Merge Conflicts"** (meaning we both edited the same line of code):
1.  Open the file shown in red.
2.  Look for `<<<<<<< HEAD` markers.
3.  Choose which code to keep (yours or the incoming update).
4.  Save the file.
5.  Run:
    ```bash
    git add .
    git commit -m "Fixed conflict"
    ```
