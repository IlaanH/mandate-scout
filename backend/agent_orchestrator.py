import os

try:
    from agents import Agent, Runner, function_tool
    from agents.run_context import RunContextWrapper
except ImportError as exc:
    raise SystemExit(
        "OpenAI Agents SDK is not installed. Install with: pip install openai-agents"
    ) from exc

from test_search import search_listings


@function_tool
def fetch_listings(
    ctx: RunContextWrapper[dict],
    location: str,
    min_price: int,
    max_price: int,
    max_listings: int,
) -> dict:
    """Fetch listings from the SeLoger app using Appium."""
    result = search_listings(location, min_price, max_price, max_listings)
    if ctx.context is None:
        ctx.context = {}
    if isinstance(ctx.context, dict):
        ctx.context["last_listings"] = result.get("listings", [])
        ctx.context["last_result"] = result
    return result


def build_agent() -> Agent:
    return Agent(
        name="RealEstateOrchestrator",
        instructions=(
            "You are an orchestrator speaking with a real estate agent. "
            "Ask clarifying questions when location, min price, max price, or listing count "
            "is missing. If the user asks to find listings (e.g., latest announcements in a "
            "location with a budget range and count), call fetch_listings with the "
            "appropriate arguments. Return the main info for each listing: price, details, "
            "and phone. Keep responses concise and professional."
        ),
        tools=[fetch_listings],
    )


def main() -> None:
    if not os.getenv("OPENAI_API_KEY"):
        print("Warning: OPENAI_API_KEY is not set.")

    import argparse

    parser = argparse.ArgumentParser(description="Run the real estate orchestrator.")
    parser.add_argument("--prompt", help="Run a single prompt and exit.")
    args = parser.parse_args()

    agent = build_agent()

    if args.prompt:
        result = Runner.run_sync(agent, args.prompt, context={})
        print(result.final_output)
        return

    previous_response_id = None
    context = {}
    print("Real estate orchestrator ready. Type 'exit' to quit.")

    while True:
        user_input = input("You: ").strip()
        if not user_input:
            continue
        if user_input.lower() in {"exit", "quit"}:
            break

        result = Runner.run_sync(
            agent,
            user_input,
            context=context,
            previous_response_id=previous_response_id,
            auto_previous_response_id=True,
        )
        previous_response_id = result.last_response_id
        print(result.final_output)


if __name__ == "__main__":
    main()
