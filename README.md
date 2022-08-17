# Chirp Developer Challenge 2022

## Install

### IBM Debater API

```shell
DEBATER_API_KEY =<your-debater-api-key>
```

### Bing News Search API

```shell
BING_API_KEY = <your-bing-api-key>
```

### Twitter API
Go to the [Development Platform](https://developer.twitter.com/en/docs/twitter-api) and click on Development Portal.

Then, click on keys and tokens on Development Portal and set the environment variables as follows.

```shell
CONSUMER_KEY=<your-consumer-key>
CONSUMER_SECRET=<your-consumer-secret>
ACCESS_TOKEN_KEY=<your-access-token-key>
ACCESS_TOKEN_SECRET=<your-access-token-secret>
BEARER_TOKEN=<your-bearer-token>
```

### Twitter User Info
Go to the [Twitter profile page](https://twitter.com/<your-bot-username>) and open a development tool on Chrome, Firefox and so on.

Then, go to the source code function on your browser and search your user ID by typing "user_id=". You can find your user ID on href attribution.

Set the bot's username and user ID as follows.

```shell
BOT_SCREEN_NAME =<your-bot-username>
BOT_ID = <your-bot-userid>
```

## dotenv
In addition, [dotenv](https://github.com/motdotla/dotenv) is used in the backend.

You can also set environment variables by adding a .env file directly under the project root folder.

## Usage
Based on your response against an original tweet on Twitter, the bot searches for documents related to that content. 

The search words are also defined in the configuration file when specifying a stance of pros and cons.

### Detail
First, if there is a post on Twitter that contains skeptical content, we accept requests to verify the content of a post by replying to the target post, including a mention to the Twitter Bot. (e.g., @Bot Find references related to this post!)

Second, when receiving the request, the Twitter Bot extracts keywords from the original post and searches for related books and news by using the Google Books and Bing News search engines.

Then, documents hit by the search is evaluated by the IBM Debater API. The content of the evaluation is based on the original Tweet's claim, including the stance of pros and cons, the strength of the claim (undetermined: and the degree of relevance of the claim).

Following that, the bot replies to the document based on the highest rating score.

As a side note, this document will either affirm the Tweet content with the strongest claim or deny the Tweet content with the strongest claim among the retrieved literature. If only low-scoring documents were found, the bot will reply no relevant documents were found.

Lastly, you can customize search methods by specifying a stance of prons and cons. In other words, you can search only one of either positive or negative documents. (e.g., @Bot Find a positive opinion on this. or Find a negative opinion on this.)
