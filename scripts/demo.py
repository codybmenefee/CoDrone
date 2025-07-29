#!/usr/bin/env python3
"""
Demo script to test Canopy Copilot functionality
"""

import asyncio
import json
from pathlib import Path
import sys

# Add packages to path
sys.path.append(str(Path(__file__).parent.parent / "packages"))

from agent_tools.tool_registry import tools
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder

async def main():
    print("🚁 Canopy Copilot Demo")
    print("=" * 50)
    
    # Initialize LangChain components
    llm = ChatOpenAI(model="gpt-4", temperature=0.1)
    
    # Create agent prompt
    system_message = """You are Canopy Copilot, an AI assistant specialized in drone data analysis and agricultural insights.
    
    You help users with:
    - Analyzing drone imagery and data
    - Processing orthomosaics and NDVI data  
    - Calculating field areas and measurements
    - Generating reports and insights
    - Estimating processing times
    - Managing drone workflows
    
    Be helpful, precise, and use the available tools when appropriate.
    """
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        MessagesPlaceholder(variable_name="chat_history"),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])
    
    # Create agent
    agent = create_openai_functions_agent(llm, tools, prompt)
    
    # Create memory
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        output_key="output"
    )
    
    # Create agent executor
    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        memory=memory,
        verbose=True,
        return_intermediate_steps=True
    )
    
    print(f"🔧 Available tools: {len(tools)}")
    for tool in tools:
        print(f"  - {tool.name}: {tool.description}")
    
    print("\n" + "=" * 50)
    
    # Demo queries
    demo_queries = [
        "What datasets are available for analysis?",
        "Analyze the orthomosaic from Farm A July 2024",
        "Calculate the area for this field: [[40.7128, -74.0060], [40.7138, -74.0050], [40.7148, -74.0070], [40.7128, -74.0080]]",
        "Estimate processing time for NDVI analysis with 300 images",
        "Generate a crop health report preview for the Farm A data"
    ]
    
    for i, query in enumerate(demo_queries, 1):
        print(f"\n🤖 Demo Query {i}: {query}")
        print("-" * 50)
        
        try:
            result = await agent_executor.ainvoke({"input": query})
            
            print(f"📤 Response:")
            print(result["output"])
            
            # Show tool calls
            if "intermediate_steps" in result and result["intermediate_steps"]:
                print(f"\n🔧 Tool calls made:")
                for step in result["intermediate_steps"]:
                    if len(step) >= 2:
                        action, observation = step
                        print(f"  - Tool: {action.tool}")
                        print(f"    Input: {action.tool_input}")
                        # Truncate long outputs
                        output = str(observation)
                        if len(output) > 200:
                            output = output[:200] + "..."
                        print(f"    Output: {output}")
                        
        except Exception as e:
            print(f"❌ Error: {e}")
        
        print("\n" + "=" * 50)
        
        # Pause between queries
        if i < len(demo_queries):
            await asyncio.sleep(1)
    
    print("✅ Demo complete!")

if __name__ == "__main__":
    asyncio.run(main())