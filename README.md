# Debatter_bot

## Overview

Debatter_bot is the Twitter Bot that brings the policy of [verifiability](https://en.wikipedia.org/wiki/Wikipedia:Verifiability) in Wikipedia to Twitter culture.

When you see a skeptical tweet, you can use the Debatter_bot to search for relevant documents.

## Demo

Please see this youtube video.

https://www.youtube.com/watch?v=(ID)

[![youtube_thumbnail](https://img.youtube.com/vi/(ID)/0.jpg)](https://www.youtube.com/watch?v=(ID))

## Setup

Debatter_bot uses several external services. Please follow the steps below to obtain the necessary information and set them as environment variables.

### IBM Debater API

IBM Debater API is an API for [Project Debater](https://research.ibm.com/interactive/project-debater/), which IBM is researching.
API key will be issued if you applied for the [Early Access Program](https://early-access-program.debater.res.ibm.com/).

> **Note**  
> We have received permission from the person in charge to use the API for the Hacakathon.  
> If you use this source code in the production level, please check [the user agreement of IBM Project Debater](https://early-access-program.debater.res.ibm.com/) and obtain approval for use from the person in charge.

If the API key is issued, set the environment variables as follows.

```shell
export DEBATER_API_KEY = <your-debater-api-key>
```

### Bing News Search API

Please refer to [this document](https://docs.microsoft.com/en-us/bing/search-apis/bing-web-search/create-bing-search-service-resource) to create a Bing resource on Azure and issue API keys and endpoints.

If the API key is issued, set the environment variables as follows.

```shell
export BING_API_KEY = <your-bing-api-key>
```

There is a problem in the Azure Node.js library and the endpoint needs to be modified as [this link](https://github.com/Azure/azure-sdk-for-js/issues/18837#issuecomment-983188162) shows.
If a endpoint that is not `https://api.bing.microsoft.com/v7.0/news/search` is specified, modify [this line](https://github.com/Mandryl/Chirp-Developer-Challenge-2022/blob/main/search/news.js#L15) in the source code　as follows.

```javascript:news.js
client.endpoint = "your specified endpoint";
```

### Twitter API

Go to the [Development Platform](https://developer.twitter.com/en/docs/twitter-api) and click on Development Portal.

Then, click on keys and tokens on Development Portal and set the environment variables as follows.

```shell
export CONSUMER_KEY=<your-consumer-key>
export CONSUMER_SECRET=<your-consumer-secret>
export ACCESS_TOKEN_KEY=<your-access-token-key>
export ACCESS_TOKEN_SECRET=<your-access-token-secret>
export BEARER_TOKEN=<your-bearer-token>
```

### Twitter User Info

Go to the [Twitter profile page](https://twitter.com/<your-bot-username>) and open a development tool on Chrome, Firefox and so on.

Then, go to the source code function on your browser and search your user ID by typing "user_id=". You can find your user ID on href attribution.

Set the bot's username and user ID as follows.

```shell
export BOT_SCREEN_NAME =<your-bot-username>
export BOT_ID = <your-bot-userid>
```

### dotenv

In addition, Debatter_bot uses [dotenv](https://github.com/motdotla/dotenv) library.

You can also set environment variables by adding a .env file directly under the project root folder.

## Deployment

Debatter_bot is built with Node.js. When you deploy, you can use a free Node.js service such as [Glitch](https://glitch.com/) or set up your Node.js environment on a paid computing service.

To start the program, simply execute the following command. After execution, the program will automatically receive Twitter Bot events.

```shell
npm start
```

## How to use

Based on your response against an original tweet on Twitter, the bot searches for documents related to that content. 

The search words are also defined in the configuration file when specifying a stance of pros and cons.

### Detail

1. If there is a post on Twitter that contains skeptical content, we accept requests to verify the content of a post by replying to the target post, including a mention to the Twitter Bot. (e.g., `@Bot Find references related to this post!`)

2. When receiving the request, the Twitter Bot extracts keywords from the original post and searches for related books and news by using the Google Books and Bing News search engines.

3. Documents hit by the search is evaluated by the IBM Debater API. The content of the evaluation is based on the original Tweet's claim, including the stance of pros and cons, the strength of the claim (undetermined: and the degree of relevance of the claim).

Following that, the bot replies to the document based on the highest rating score.

> **Note**  
> This document will either affirm the Tweet content with the strongest claim or deny the Tweet content with the strongest claim among the retrieved literature.  
> If only low-scoring documents were found, the bot will reply no relevant documents were found.

### Specifying a stance

You can customize search methods by specifying a stance of prons and cons. In other words, you can search only one of either positive or negative documents. (e.g., `@Bot Find a positive opinion on this.` or `Find a negative opinion on this.`)
