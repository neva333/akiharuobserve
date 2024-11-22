require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log('Bot is online!');
});

const twitterAccount = 'akiharu_YouTube';
const youtubeChannelId = '@akiharu_youtube';
const discordChannelId = 'DiscordチャンネルID';

// Discordにメッセージを送信する関数
async function sendToDiscord(message) {
    const channel = await client.channels.fetch(discordChannelId);
    if (channel) {
        channel.send(message);
    } else {
        console.error('Failed to fetch Discord channel');
    }
}

// Twitterの最新ツイートをチェックする関数
async function checkTwitter() {
    try {
        const response = await axios.get(`https://twitter.com/${twitterAccount}`);
        const $ = cheerio.load(response.data);
        const tweets = $('div[data-testid="tweet"]');
        if (tweets.length > 0) {
            const latestTweet = tweets.first();
            const tweetUrl = `https://twitter.com${latestTweet.find('a').attr('href')}`;
            await sendToDiscord(`New tweet from ${twitterAccount}: ${tweetUrl}`);
        }
    } catch (error) {
        console.error('Failed to fetch tweets:', error);
    }
}

// YouTubeチャンネルのURL
const youtubeChannelUrl = 'https://www.youtube.com/channel/@akiharu_youtube/videos';

// YouTubeの最新動画、配信、ショートをチェックする関数
async function checkYouTube() {
    try {
        const response = await axios.get(youtubeChannelUrl);
        const $ = cheerio.load(response.data);

        // 通常の動画
        const videos = $('a#video-title');
        if (videos.length > 0) {
            const latestVideo = videos.first();
            const videoUrl = `https://www.youtube.com${latestVideo.attr('href')}`;
            const videoTitle = latestVideo.attr('title');
            await sendToDiscord(`New video: ${videoTitle} - ${videoUrl}`);
        }

        // ライブ配信
        const liveStreams = $('a#video-title[aria-label*="ライブ配信中"]');
        if (liveStreams.length > 0) {
            const latestLiveStream = liveStreams.first();
            const liveStreamUrl = `https://www.youtube.com${latestLiveStream.attr('href')}`;
            const liveStreamTitle = latestLiveStream.attr('title');
            await sendToDiscord(`Live stream: ${liveStreamTitle} - ${liveStreamUrl}`);
        }

        // ショート動画
        const shorts = $('a#video-title[aria-label*="ショート"]');
        if (shorts.length > 0) {
            const latestShort = shorts.first();
            const shortUrl = `https://www.youtube.com${latestShort.attr('href')}`;
            const shortTitle = latestShort.attr('title');
            await sendToDiscord(`New short: ${shortTitle} - ${shortUrl}`);
        }
    } catch (error) {
        console.error('Failed to fetch YouTube videos:', error);
    }
}

client.login(process.env.DISCORD_TOKEN);

// 定期的にチェックする
setInterval(checkTwitter, 60000); // 1分ごとにチェック
setInterval(checkYouTube, 60000); // 1分ごとにチェック
