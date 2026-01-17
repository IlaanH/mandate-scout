from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

APPIUM_ENDPOINT = "https://devicefarm-interactive-global.us-west-2.api.aws/remote-endpoint/WC1BbXotRGF0ZT0yMDI2MDExN1QxMjM3NDlaJlgtQW16LUNyZWRlbnRpYWw9QVNJQVFJSlJTRTc0RVhKVUdNQ1AlMkYyMDI2MDExNyUyRnVzLXdlc3QtMiUyRmRldmljZWZhcm0lMkZhd3M0X3JlcXVlc3QmWC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmYXJuPWFybiUzQWF3cyUzQWRldmljZWZhcm0lM0F1cy13ZXN0LTIlM0EwMTc4MjA2OTA0MjQlM0FzZXNzaW9uJTNBNTU3ZWJlMjgtOWIzMS00ZGMyLTlmZWEtY2VkYjc2OTBmZmFlJTJGYjk3ZGI0MjAtMzQxZS00N2JkLThhZmMtNzg4Yjk2MDA1MmI2JTJGMDAwMDAmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JlgtQW16LVNpZ25hdHVyZT1jMTIzOWFjMzQyMTI1ZGU1MTMwYTM0MjVlMWUzMjdiM2RjZDhjODI0NzRiZDE4NmY5MDRjM2NjMjljMjNjN2EwJlgtQW16LVNlY3VyaXR5LVRva2VuPUZ3b0daWEl2WVhkekVLNyUyRiUyRiUyRiUyRiUyRiUyRiUyRiUyRiUyRiUyRndFYURPJTJCWVFEMU9pb3dWZWVudXJDTFRBaUswJTJCSjhXRUx3QnhqV1VZUW5rVGtKT3h1bzNxTDVja0U0Zk5hTDE5d3hVekFhQU16elh3VmFMJTJGR1NiNFJ0WGlITiUyRmVYWERTZXltb09XJTJCNHFyaEE1OUd2WUwwRXNEZ0JBRWFyemtnZ2Q0MmMlMkZQJTJGb2tuaWpWQ01Yamo3TVhkMjdQYnY2T282RkxRd2I5ZTJRN1p5NmtBaEIlMkJlZXhyTXpSb2txM055U3BMRkJ0VzFPT25iTUxTUlJ6ck1neHpJUThIVE5UV1B2M0Y2dXQ2ZFlGZEFmUXhEakJUSWVVRWxTTjRjSmFpa2Y0T3dmbGVaaW5BYSUyRnhJWE9KWUxSNWdRUjd2OGxINjYxQXI2ZVhDJTJCNGNQQyUyQkJVMllIV3R1YVFxSFJXRXZuanI4UDZnUkRJTldNWDdhOTZGTEZRbSUyQmx5TCUyRnVyd0VGZUIyczljRXFuT2FPWU4wSjRTRGhQdkRVclolMkJ0WE9sSkt5cVpWRVVQTGJEMSUyQm10R2d0b3l3VVlNUHBTUGNOUlpFJTJGcSUyQkFMZ2JNR2VLRmh3YXdmSTBueXQwb3hjc25ydGplUnNJSTY1a1FkN0J5Yzl2MExJb3ZJV005aWRJN2dXb3lpR3lhM0xCaktnQWNCT3luRVlxUkNEZDJjOEdWeWppQ25PbGJ3SGl3RzVVJTJGTW4lMkJWTEpQQyUyRm9VYU5ZQXh5Y2lCbDIzMkR0MUMwTW5BT0p1ZiUyQjJEVGEyaU00bmNJalV2endFZ1NpN2p2a1c0WWEybjN6eEZwTlZmSURlQTRnUEZ4TVd1eUpMNmVabUlQWFZKUkUlMkZVbm1YTERza3JlOERETHElMkZUcFZvNWdxSGpvQ1p4TlRGTUt0clhSbEZlVW9qNFd4ZGZna2JDd3l4ekthR0FGZjNqOEU5R3pwcFN4dWhINW8lM0QlN0NPVEF1TVRFMUxqRXlNeTQyT0ElM0QlM0Q"

APP_PACKAGE = "com.seloger.android"

options = UiAutomator2Options()
options.platform_name = "Android"
options.automation_name = "UiAutomator2"
# Remove browser_name since we're testing a native app

driver = webdriver.Remote(
    command_executor=APPIUM_ENDPOINT,
    options=options
)

wait = WebDriverWait(driver, 15)

# Check if app is installed
print("Checking if app is installed...")
is_installed = driver.is_app_installed(APP_PACKAGE)
print(f"App {APP_PACKAGE} installed: {is_installed}")

if is_installed:
    print(f"Launching {APP_PACKAGE}...")
    driver.activate_app(APP_PACKAGE)
    print("App launched successfully!")

    # Wait for app to load
    time.sleep(5)

    try:
        # Step 1: Click "Get started"
        print("Step 1: Clicking 'Get started'...")
        get_started = wait.until(
            EC.element_to_be_clickable((AppiumBy.XPATH, '//android.widget.TextView[@content-desc="Get started"]'))
        )
        get_started.click()
        time.sleep(2)

        # Step 2: Click "I'm looking to buy or rent"
        print("Step 2: Clicking 'I'm looking to buy or rent'...")
        buy_or_rent = wait.until(
            EC.element_to_be_clickable((AppiumBy.XPATH, '//android.view.View[@content-desc="I\'m looking to buy or rent"]'))
        )
        buy_or_rent.click()
        time.sleep(2)

        # Step 3: Click "Buy for personal use"
        print("Step 3: Clicking 'Buy for personal use'...")
        buy_personal = wait.until(
            EC.element_to_be_clickable((AppiumBy.XPATH, '//android.view.View[@content-desc="Buy for personal use"]'))
        )
        buy_personal.click()
        time.sleep(2)

        # Step 4: Click the next element
        print("Step 4: Clicking next element...")
        next_element = wait.until(
            EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.widget.ScrollView/android.view.View/android.view.View/android.view.View'))
        )
        next_element.click()
        time.sleep(2)

        # Step 5: Enter "Ile de France" in the search field
        print("Step 5: Entering 'Ile de France'...")
        search_field = wait.until(
            EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[1]/android.widget.EditText'))
        )
        search_field.click()
        search_field.send_keys("Ile de France")
        time.sleep(3)

        # Step 6: Click first child of the results container
        print("Step 6: Clicking first search result...")
        results_container = wait.until(
            EC.presence_of_element_located((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[2]'))
        )
        # Get first child
        first_result = results_container.find_element(AppiumBy.XPATH, './*[1]')
        first_result.click()
        time.sleep(2)

        # Step 7: Click "Next"
        print("Step 7: Clicking 'Next'...")
        next_button = wait.until(
            EC.element_to_be_clickable((AppiumBy.XPATH, '//android.widget.TextView[@content-desc="Next"]'))
        )
        next_button.click()
        time.sleep(2)

        # Step 8: Click "House & Apartment"
        print("Step 8: Clicking 'House & Apartment'...")
        house_apt = wait.until(
            EC.element_to_be_clickable((AppiumBy.XPATH, '//android.view.View[@content-desc="House & Apartment"]'))
        )
        house_apt.click()
        time.sleep(2)

        # Step 9: Enter square footage "20"
        print("Step 9: Entering square footage '20'...")
        sqft_field = wait.until(
            EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.widget.ScrollView/android.view.View/android.view.View[1]/android.widget.EditText'))
        )
        sqft_field.click()
        sqft_field.send_keys("20")
        time.sleep(2)

        # Step 10: Click on rooms field
        print("Step 10: Clicking on rooms field...")
        rooms_field = wait.until(
            EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.widget.ScrollView/android.view.View/android.view.View[2]/android.widget.EditText/android.view.View[2]'))
        )
        rooms_field.click()
        time.sleep(2)

        # Step 11: Select third child (2 rooms) from the list
        print("Step 11: Selecting 2 rooms (third child)...")
        rooms_list = wait.until(
            EC.presence_of_element_located((AppiumBy.XPATH, '/hierarchy/android.view.ViewGroup/android.view.View/android.view.View/android.view.View/android.widget.ScrollView'))
        )
        # Get third child (Any=1st, 1=2nd, 2=3rd)
        room_option = rooms_list.find_element(AppiumBy.XPATH, './*[3]')
        room_option.click()
        time.sleep(2)

        # Step 12: Enter budget "400000"
        print("Step 12: Entering budget '400000'...")
        budget_field = wait.until(
            EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.widget.ScrollView/android.view.View/android.view.View[3]/android.widget.EditText/android.view.View[2]'))
        )
        budget_field.click()
        budget_field.send_keys("400000")
        time.sleep(2)

        # Step 13: Click "Next"
        print("Step 13: Clicking 'Next'...")
        next_button2 = wait.until(
            EC.element_to_be_clickable((AppiumBy.XPATH, '//android.widget.TextView[@content-desc="Next"]'))
        )
        next_button2.click()
        time.sleep(2)

        # Step 14: Click "Skip" (first)
        print("Step 14: Clicking first 'Skip'...")
        skip_button1 = wait.until(
            EC.element_to_be_clickable((AppiumBy.XPATH, '//android.widget.TextView[@content-desc="Skip"]'))
        )
        skip_button1.click()
        time.sleep(2)

        # Step 15: Click "Skip" (second)
        print("Step 15: Clicking second 'Skip'...")
        skip_button2 = wait.until(
            EC.element_to_be_clickable((AppiumBy.XPATH, '//android.widget.TextView[@content-desc="Skip"]'))
        )
        skip_button2.click()
        time.sleep(2)

        print("\n✓ All steps completed successfully!")
        print("Waiting 30 seconds to observe...")
        time.sleep(30)

    except Exception as e:
        print(f"\n✗ Error during automation: {str(e)}")
        print(f"Current activity: {driver.current_activity}")
        # Take screenshot if possible
        try:
            driver.save_screenshot("/tmp/error_screenshot.png")
            print("Screenshot saved to /tmp/error_screenshot.png")
        except:
            pass
else:
    print(f"ERROR: App {APP_PACKAGE} is NOT installed on the device!")
    print("Please make sure you uploaded the APK to AWS Device Farm.")

driver.quit()