import subprocess
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def run_menu_test():
    # Commands sequence:
    # 10: Load demo data
    # 7: Leaderboard
    # 8: Defaulters list
    # 9: Low attendance notifications & recommendations
    # 4: Check student attendance (Roll 1)
    # 5: Bunk calculator (Roll 1)
    # 6: Recovery planner (Roll 5)
    # 3: View today's attendance
    # 11: Exit

    input_data = "10\n7\n8\n9\n4\n1\n5\n1\n6\n5\n3\n11\n"

    process = subprocess.Popen(
        [sys.executable, "main.py"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding='utf-8'
    )

    stdout, stderr = process.communicate(input=input_data)
    print("=== STDOUT OUTPUT ===")
    print(stdout)
    if stderr:
        print("=== STDERR OUTPUT ===")
        print(stderr)

if __name__ == "__main__":
    run_menu_test()
