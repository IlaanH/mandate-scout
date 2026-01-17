from appium import webdriver
from appium.options.android import UiAutomator2Options
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import json
import re

APPIUM_ENDPOINT = "https://devicefarm-interactive-global.us-west-2.api.aws/remote-endpoint/WC1BbXotRGF0ZT0yMDI2MDExN1QxNTE3NDdaJlgtQW16LUNyZWRlbnRpYWw9QVNJQVFJSlJTRTc0QkhKNzVRVFklMkYyMDI2MDExNyUyRnVzLXdlc3QtMiUyRmRldmljZWZhcm0lMkZhd3M0X3JlcXVlc3QmWC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmYXJuPWFybiUzQWF3cyUzQWRldmljZWZhcm0lM0F1cy13ZXN0LTIlM0EwMTc4MjA2OTA0MjQlM0FzZXNzaW9uJTNBNTU3ZWJlMjgtOWIzMS00ZGMyLTlmZWEtY2VkYjc2OTBmZmFlJTJGNTcwOWQ3NjUtMjQ5MC00MTllLTlhN2UtOWViZTU2NDQ2MDRlJTJGMDAwMDAmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JlgtQW16LVNpZ25hdHVyZT1lNjdhZGY1YzIxNDE0NDM4MjE2ODI4NjQ4ZWJhZDNhM2NlYTgyZWJkYzEzN2MyNjZjMDMxMjljMzI1ZWM2ZTViJlgtQW16LVNlY3VyaXR5LVRva2VuPUZ3b0daWEl2WVhkekVMSCUyRiUyRiUyRiUyRiUyRiUyRiUyRiUyRiUyRiUyRndFYURLVjJOanVSTm5qYWlIZU9WQ0xUQXJCMWZta29ZTVZSUFJDcWRrdVRjUlN6Tk1PQkx5WGs3MDFtQlZiSTZ2Q2gyNkdHZ2Yycm8zeDA5JTJGUSUyRlRTNyUyQkY5cGJ1bDBQYng2QkwzJTJCQXYxOTBkemZ6WTBUckZJNzJwdXpLRHV3Ylk2M3FuZjN6Qkd6RXBMWTRYUkclMkZ1WlNnbHdjSXlBelF4JTJGdzhkcmtsQllGbjczZklKQkIxRXZEZ2JOZ1NEJTJGZCUyRmxYcG4xNTN5UGlUZVZXRUUlMkIzVmtlV0daOGxsM0pHSVVraEQ4QWJHa2hKeTJYaHhJYkV0WWhGY0RFcXklMkJiYTR3QmxYZEhkNUJPZUk4Wmh4RUJFOVNacUQ1Z3N4Y3dJdWlFY25kczRTeGE2JTJCcjhUbXBWalJMU2VLd2NCTUJCMFVieGVrYTk3d2F4Y1JRUlREcUVmdURmYW1DTVZ2RzVnR1hkbUQ1Mm83dHY2ZVNKQXJkV2hYNVlZa1VUSlJvYWdpVXE0UTRLdDJzJTJCN2RXU3BaU2dKZXRFNkZGWGcwdU02NVBUZyUyRjVJUWhyZ3NZZVNDSmZWZExuelpMbWZZZ1VEalZFdlBHNTZPcjhEZkRwM2N6Y0lvTTJFWEs5JTJCRXRPWVNpR3lhM0xCaktnQVNLdHlXc05UbjhiaDgwbDBEekNkamRiZmtvN1BtZFdnYVNLUHZsUWpNbXJTajlRM1Q2WnhQN0M4MHN4SzJFMUQ5b21RJTJGeXZEa050cEVGR1h3N1BtcSUyRjJvR2hRdk5Od1JJSmJMaURKWHglMkJuRzIlMkZNSldkTVlqQXp1OFVJRWRJdm53eUlNN3VBZTZvUnRyWkpJWHRDempwSGlIWWZkcDI3azZjWmRRJTJGVEZ4YiUyRnY3VjhxTnpMT0lSTEs3aUNIdGQ5T2xJaURuMHVxcnM0SkRPRmpuTkZDZFklM0QlN0NPVEF1TVRFMUxqRXlNeTQyT0ElM0QlM0Q"

APP_PACKAGE = "com.seloger.android"


def search_listings(location, min_price, max_price, max_listings):
    driver = None
    listings_data = []
    result = {
        "location": location,
        "min_price": min_price,
        "max_price": max_price,
        "requested": max_listings,
        "listings": listings_data,
    }
    try:
        options = UiAutomator2Options()
        options.platform_name = "Android"
        options.automation_name = "UiAutomator2"

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
            # Close any existing instance of the app
            print("Closing any existing app instances...")
            try:
                driver.terminate_app(APP_PACKAGE)
                print("Closed existing app instance")
                time.sleep(2)
            except Exception as e:
                print(f"No existing instance to close or error: {str(e)}")

            print(f"Launching fresh instance of {APP_PACKAGE}...")
            driver.activate_app(APP_PACKAGE)
            print("App launched successfully!")

            # Wait for app to load
            time.sleep(5)

            try:
                # # Step 1: Click to go to search
                print("Step 1: Clicking search tab...")
                search_tab = wait.until(
                    EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View[2]/android.view.View/android.view.View/android.view.View[2]'))
                )
                search_tab.click()
                time.sleep(2)

                # Step 2: Click dropdown
                print("Step 2: Clicking dropdown...")
                dropdown = wait.until(
                    EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View[1]/android.view.View/android.view.View[1]/android.view.View[2]/android.widget.Button'))
                )
                dropdown.click()
                time.sleep(2)

                # Step 3: Start a new search
                print("Step 3: Clicking 'Start a new search'...")
                new_search = wait.until(
                    EC.element_to_be_clickable((AppiumBy.XPATH, '//android.widget.TextView[@content-desc="Start a new search"]'))
                )
                new_search.click()
                time.sleep(2)

                # Step 4: Select location
                print("Step 4: Clicking 'Select location'...")
                select_location = wait.until(
                    EC.element_to_be_clickable((AppiumBy.XPATH, '//android.widget.TextView[@content-desc="Select location"]'))
                )
                select_location.click()
                time.sleep(2)

                # Step 5: Click the mandatory button
                print("Step 5: Clicking mandatory location button...")
                mandatory_button = wait.until(
                    EC.element_to_be_clickable((AppiumBy.XPATH, '//android.widget.Button[@content-desc="Mandatory. label is Location. text is Enter location or zip code. . ."]'))
                )
                mandatory_button.click()
                time.sleep(2)

                # Step 6: Enter location in the text field
                print(f"Step 6: Entering location '{location}'...")
                text_field = wait.until(
                    EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[1]/android.widget.EditText'))
                )
                text_field.send_keys(str(location))
                time.sleep(3)

                # Step 7: Select first result
                print("Step 7: Selecting first location result...")
                results_container = wait.until(
                    EC.presence_of_element_located((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[2]'))
                )
                first_result = results_container.find_element(AppiumBy.XPATH, './*[1]')
                first_result.click()
                time.sleep(2)

                # Step 8: Click "Show Results" after location selection
                print("Step 8: Clicking 'Show Results'...")
                show_results_1 = wait.until(
                    EC.element_to_be_clickable((AppiumBy.XPATH, '//android.widget.TextView[@content-desc="Show Results"]'))
                )
                show_results_1.click()
                time.sleep(3)

                # Step 9: Enter min price
                print("Step 9: Entering min price...")
                min_price_field = wait.until(
                    EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[2]/android.widget.ScrollView/android.view.View/android.widget.EditText[1]'))
                )
                min_price_field.click()
                min_price_field.send_keys(str(min_price))
                driver.hide_keyboard()
                time.sleep(2)

                # Step 10: Enter max price
                print("Step 10: Entering max price...")
                max_price_field = wait.until(
                    EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[2]/android.widget.ScrollView/android.view.View/android.widget.EditText[2]'))
                )
                max_price_field.click()
                max_price_field.send_keys(str(max_price))
                driver.hide_keyboard()
                time.sleep(2)
                # ---------------------------------------------------------------------------
                # # Step 11: Min rooms dropdown - COMMENTED OUT FOR NOW
                # print("Step 11: Selecting min rooms...")
                # min_rooms_spinner = wait.until(
                #     EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[2]/android.widget.ScrollView/android.view.View/android.widget.EditText[3]/android.widget.Spinner'))
                # )
                # min_rooms_spinner.click()
                # time.sleep(1)
                # # Select second child (1 room)
                # rooms_dropdown = wait.until(
                #     EC.presence_of_element_located((AppiumBy.XPATH, '/hierarchy/android.view.ViewGroup/android.view.View/android.view.View/android.view.View/android.widget.ScrollView'))
                # )
                # min_rooms_option = rooms_dropdown.find_element(AppiumBy.XPATH, './*[2]')
                # min_rooms_option.click()
                # time.sleep(1)
                # # Close dropdown with back button
                # driver.back()
                # time.sleep(2)

                # # Step 12: Max rooms dropdown - COMMENTED OUT FOR NOW
                # print("Step 12: Selecting max rooms...")
                # max_rooms_spinner = wait.until(
                #     EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[2]/android.widget.ScrollView/android.view.View/android.widget.EditText[4]/android.widget.Spinner'))
                # )
                # max_rooms_spinner.click()
                # time.sleep(1)
                # # Select fourth child (3 rooms)
                # max_rooms_dropdown = wait.until(
                #     EC.presence_of_element_located((AppiumBy.XPATH, '/hierarchy/android.view.ViewGroup/android.view.View/android.view.View/android.view.View/android.widget.ScrollView'))
                # )
                # max_rooms_option = max_rooms_dropdown.find_element(AppiumBy.XPATH, './*[4]')
                # max_rooms_option.click()
                # time.sleep(1)
                # # Close dropdown with back button
                # driver.back()
                # time.sleep(2)

                # # Step 13: Min bedrooms dropdown - COMMENTED OUT FOR NOW
                # print("Step 13: Selecting min bedrooms...")
                # min_bedrooms_spinner = wait.until(
                #     EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[2]/android.widget.ScrollView/android.view.View/android.widget.EditText[3]/android.widget.Spinner'))
                # )
                # min_bedrooms_spinner.click()
                # time.sleep(1)
                # # Select second child (1 bedroom)
                # bedrooms_dropdown = wait.until(
                #     EC.presence_of_element_located((AppiumBy.XPATH, '/hierarchy/android.view.ViewGroup/android.view.View/android.view.View/android.view.View/android.widget.ScrollView'))
                # )
                # min_bedrooms_option = bedrooms_dropdown.find_element(AppiumBy.XPATH, './*[2]')
                # min_bedrooms_option.click()
                # time.sleep(1)
                # # Close dropdown with back button
                # driver.back()
                # time.sleep(2)

                # # Step 14: Max bedrooms dropdown - COMMENTED OUT FOR NOW
                # print("Step 14: Selecting max bedrooms...")
                # max_bedrooms_spinner = wait.until(
                #     EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[2]/android.widget.ScrollView/android.view.View/android.widget.EditText[4]/android.widget.Spinner'))
                # )
                # max_bedrooms_spinner.click()
                # time.sleep(1)
                # # Select third child (2 bedrooms)
                # max_bedrooms_dropdown = wait.until(
                #     EC.presence_of_element_located((AppiumBy.XPATH, '/hierarchy/android.view.ViewGroup/android.view.View/android.view.View/android.view.View/android.widget.ScrollView'))
                # )
                # max_bedrooms_option = max_bedrooms_dropdown.find_element(AppiumBy.XPATH, './*[3]')
                # max_bedrooms_option.click()
                # time.sleep(1)
                # # Close dropdown with back button
                # driver.back()
                # time.sleep(2)

                # # Step 15: Enter min plot area
                # print("Step 15: Entering min plot area...")
                # min_plot_field = wait.until(
                #     EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[2]/android.widget.ScrollView/android.view.View/android.widget.EditText[3]'))
                # )
                # min_plot_field.click()
                # min_plot_field.send_keys("50")
                # driver.hide_keyboard()
                # time.sleep(2)
                #
                # # Step 16: Enter max plot area
                # print("Step 16: Entering max plot area...")
                # max_plot_field = wait.until(
                #     EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[2]/android.widget.ScrollView/android.view.View/android.widget.EditText[4]'))
                # )
                # max_plot_field.click()
                # max_plot_field.send_keys("200")
                # driver.hide_keyboard()
                # time.sleep(2)
                #
                # # Step 17: Enter min area
                # print("Step 17: Entering min area...")
                # min_area_field = wait.until(
                #     EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[2]/android.widget.ScrollView/android.view.View/android.widget.EditText[5]'))
                # )
                # min_area_field.click()
                # min_area_field.send_keys("30")
                # driver.hide_keyboard()
                # time.sleep(2)
                #
                # # Step 18: Enter max area
                # print("Step 18: Entering max area...")
                # max_area_field = wait.until(
                #     EC.element_to_be_clickable((AppiumBy.XPATH, '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[2]/android.widget.ScrollView/android.view.View/android.widget.EditText[6]'))
                # )
                # max_area_field.click()
                # max_area_field.send_keys("100")
                # driver.hide_keyboard()
                # time.sleep(2)
                #
                # # Step 19: Select project type - Resale
                # print("Step 19: Selecting 'Resale' project type...")
                # resale = wait.until(
                #     EC.element_to_be_clickable((AppiumBy.XPATH, '//android.view.View[@content-desc="Resale"]'))
                # )
                # resale.click()
                # time.sleep(2)

                # Step 20: Click "Show Results"
                # ---------------------------------------------------------------------------

                print("Step 20: Clicking 'Show Results'...")
                show_results = wait.until(
                    EC.element_to_be_clickable((AppiumBy.XPATH, '//android.widget.TextView[@content-desc="Show Results"]'))
                )
                show_results.click()
                time.sleep(5)

                # print("\n✓ Search completed! Now scraping listings...")

                # Step 21: Scrape listings
                listings_data.clear()
                seen_signatures = set()
                attempts = 0
                max_attempts = max_listings * 6
                cards_container_xpath = '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View[1]/android.view.View/android.view.View[2]/android.view.View/android.view.View[1]'

                # Get total number of elements (cards + ads)
                cards_container = wait.until(
                    EC.presence_of_element_located((AppiumBy.XPATH, cards_container_xpath))
                )

                child_index = 1
                scraped_count = 0

                while scraped_count < max_listings and attempts < max_attempts:
                    try:
                        # Get the child element
                        child_xpath = f"{cards_container_xpath}/*[{child_index}]"

                        try:
                            child_element = driver.find_element(AppiumBy.XPATH, child_xpath)
                        except:
                            print(f"No more elements found at index {child_index}. Stopping.")
                            break

                        # Check if it's a real card by checking the class attribute
                        element_class = child_element.get_attribute("class")
                        print(f"\n--- Checking element {child_index}, class: {element_class} ---")

                        # Skip ads - only process if class is "android.view.View"
                        if element_class != "android.view.View":
                            print(f"Skipping ad element (class: {element_class})")
                        else:
                            # It's a real card, click it
                            print(f"Found card #{scraped_count + 1}, clicking...")
                            child_element.click()
                            time.sleep(3)
                            attempts += 1

                            # Scrape data from listing page
                            price = "N/A"
                            details = "N/A"
                            phone_number = "N/A"
                            missing_fields = False

                            try:
                                # Price
                                try:
                                    price_element = driver.find_element(AppiumBy.XPATH,
                                        '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[1]/android.view.View[4]/android.view.View[1]/android.widget.TextView[1]')
                                    price = price_element.text
                                    print(f"✓ Price: {price}")
                                except Exception:
                                    missing_fields = True
                                    print("✗ Could not find price element.")

                                # Details string (rooms, bedrooms, area, floor)
                                try:
                                    details_element = driver.find_element(AppiumBy.XPATH,
                                        '/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/e1.r0/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[1]/android.view.View[4]/android.widget.TextView[2]')
                                    details = details_element.text
                                    print(f"✓ Details: {details}")
                                except Exception:
                                    missing_fields = True
                                    print("✗ Could not find details element.")

                                # Contact phone number
                                try:
                                    call_button = driver.find_element(
                                        AppiumBy.XPATH,
                                        '//android.widget.TextView[@content-desc="Call"]'
                                    )
                                    call_button.click()
                                    time.sleep(2)
                                    try:
                                        phone_elements = driver.find_elements(
                                            AppiumBy.XPATH,
                                            '//*[@text!=""]'
                                        )
                                        best_match = None
                                        best_digits = 0
                                        for element in phone_elements:
                                            text = element.text.strip()
                                            if not text or any(ch.isalpha() for ch in text):
                                                continue
                                            digits_only = re.sub(r"\D", "", text)
                                            if len(digits_only) >= 6 and len(digits_only) > best_digits:
                                                best_match = text
                                                best_digits = len(digits_only)
                                        if best_match:
                                            phone_number = best_match
                                        if phone_number != "N/A":
                                            print(f"✓ Phone: {phone_number}")
                                        else:
                                            print("✗ Could not find phone element with a number.")
                                    except Exception as e:
                                        print(f"✗ Could not find phone element: {str(e)}")
                                    try:
                                        driver.find_element(
                                            AppiumBy.XPATH,
                                            '//android.widget.TextView[@content-desc="Call"]'
                                        )
                                    except Exception:
                                        driver.back()
                                        time.sleep(1)
                                except Exception as e:
                                    print(f"✗ Could not click Call button: {str(e)}")

                                if missing_fields or price == "N/A" or details == "N/A":
                                    print("Skipping listing due to missing price/details.")
                                else:
                                    signature = f"{price}|{details}|{phone_number}"
                                    if signature in seen_signatures:
                                        print("Skipping duplicate listing (price/details match).")
                                    else:
                                        seen_signatures.add(signature)
                                        listing_data = {
                                            'index': scraped_count + 1,
                                            'price': price,
                                            'details': details,
                                            'phone': phone_number
                                        }
                                        listings_data.append(listing_data)
                                        scraped_count += 1

                            except Exception as scrape_error:
                                print(f"✗ General error scraping listing: {str(scrape_error)}")

                            # Go back to listings
                            driver.back()
                            time.sleep(2)

                        # Move to next child
                        child_index += 1

                        # Listings are virtualized; only the two visible slots exist in the DOM.
                        if child_index > 2:
                            print("Scrolling to see more listings...")
                            driver.swipe(500, 1500, 500, 800, 500)  # Scroll down
                            time.sleep(2)
                            child_index = 1

                    except Exception as e:
                        print(f"Error processing element {child_index}: {str(e)}")
                        print("Moving to next element...")
                        child_index += 1
                        continue
                if attempts >= max_attempts:
                    print("Stopping scrape after too many attempts without enough new listings.")

                # Print summary
                print(f"\n\n{'='*50}")
                print(f"SCRAPING COMPLETE - Total listings scraped: {len(listings_data)}")
                print(f"{'='*50}")
                for listing in listings_data:
                    print(f"\nListing {listing['index']}:")
                    print(f"  Price: {listing['price']}")
                    print(f"  Details: {listing['details']}")
                    print(f"  Phone: {listing['phone']}")

                print("\nWaiting 10 seconds before closing...")
                time.sleep(10)

            except Exception as e:
                result["error"] = str(e)
                print(f"\n✗ Error during automation: {str(e)}")
                if driver is not None:
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
            result["error"] = f"App {APP_PACKAGE} is NOT installed on the device!"

    except Exception as e:
        result["error"] = str(e)
    finally:
        if driver is not None:
            driver.quit()
    result["scraped"] = len(listings_data)
    return result

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Run SeLoger search automation.")
    parser.add_argument("location", help="Location or zip code to search")
    parser.add_argument("min_price", type=int, help="Minimum price")
    parser.add_argument("max_price", type=int, help="Maximum price")
    parser.add_argument("max_listings", type=int, help="Number of listings to scrape")
    args = parser.parse_args()

    data = search_listings(args.location, args.min_price, args.max_price, args.max_listings)
    print(json.dumps(data, ensure_ascii=False, indent=2))
