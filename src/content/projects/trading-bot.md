---
title: "Real-time microtrade bot"
year: 2024
tagline: "Python trading bot executing microtrade strategies on real-time tick data across 20+ symbols. Live ticks via Alpaca, historical via EODHD. Strategy logic optimised to extract revenue from short-window price movement."
tags: ["Python", "Alpaca", "EODHD", "Real-time"]
category: "selected"
order: 6
role: "Solo build"
coverImage: "../../assets/projects/trading-bot/01.png"
gallery:
  - "../../assets/projects/trading-bot/02.png"
---

A Python trading bot that runs microtrade strategies against real-time tick data across **20+ symbols**. Live ticks stream in via the Alpaca API; historical context loads from EODHD. Strategy logic is tuned to short-window price movement, with the position-sizing and risk layer designed around the brief windows the strategy actually trades.

The interesting engineering problem isn't the strategy itself. It's everything around it: keeping the tick pipeline lossless under bursty load, executing orders before the edge evaporates, and reconciling positions cleanly when the broker's view and the bot's view drift apart.
