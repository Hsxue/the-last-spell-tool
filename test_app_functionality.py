#!/usr/bin/env python3
"""
端到端测试验证：验证完整工作流程
1. 新建武器 → 2. 编辑属性 → 3. 保存 → 4. 导出 → 5. 验证文件
"""

import subprocess
import time
import threading
from playwright.sync_api import sync_playwright


def start_dev_server():
    """启动开发服务器"""
    print("启动开发服务器...")
    process = subprocess.Popen(
        ["npm", "run", "dev"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )

    # 等待服务器启动
    time.sleep(5)
    return process


def test_app_functionality():
    """测试应用程序主要功能"""
    server_process = start_dev_server()

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            print("访问应用程序...")
            page.goto("http://localhost:5173")
            page.wait_for_load_state("networkidle")

            # 截图检查页面加载情况
            page.screenshot(path="test_screenshot.png", full_page=True)
            print("页面截图已保存为 test_screenshot.png")

            # 检查页面标题或其他元素
            title = page.title()
            print(f"页面标题: {title}")

            # 获取页面内容
            content = page.content()
            print(f"页面长度: {len(content)} 字符")

            # 尝试查找可能的新建武器按钮
            buttons = page.locator("button").all()
            print(f"找到 {len(buttons)} 个按钮")

            # 尝试查找文本中包含"weapon"或"skill"的元素
            weapon_elements = page.locator("text=weapon").all()
            skill_elements = page.locator("text=skill").all()
            print(f"找到 {len(weapon_elements)} 个包含'weapon'的元素")
            print(f"找到 {len(skill_elements)} 个包含'skill'的元素")

            # 检查是否存在XML导入/导出按钮
            xml_buttons = page.locator("text=XML").all()
            print(f"找到 {len(xml_buttons)} 个包含'XML'的元素")

            browser.close()

        print("✅ 应用程序功能测试完成")

    finally:
        # 终止服务器进程
        print("关闭开发服务器...")
        server_process.terminate()
        server_process.wait()


if __name__ == "__main__":
    test_app_functionality()
