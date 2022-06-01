import { Telegraf, Telegram } from 'telegraf'
import nodeHtmlToImage from 'node-html-to-image'
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import moment from 'moment';
import { saveReview } from '../services/reviews';
import fetch from 'node-fetch';

type Font = {
  fontFamily: string,
  fontWeight: string,
  format: string,
  src: string
}

type SupportedFont = 'Roboto-Light'|'Roboto-Medium'

const FontFaceDescriptors = {
  'Roboto-Light': {
    fontFamily: 'Roboto',
    fontWeight: 'Regular',
    format: 'truetype',
    src: 'fonts/Roboto-Light.ttf'
  },
  'Roboto-Medium': {
    fontFamily: 'Roboto',
    fontWeight: 'Bold',
    format: 'truetype',
    src: 'fonts/Roboto-Medium.ttf'
  }
}

const token = '5192270450:AAGpKfqPTxwqGMYzIsl8TtfXlhjfbHxrC0E';
const AUTHOR_DISPLAY_NAME_MAX_LENGTH = 20;
const TEXT_MAX_LENGTH = 1000;

const bot = new Telegraf(token)
const telegram = new Telegram(token)

bot.command('quit', (ctx) => {
  // Explicit usage
  ctx.telegram.leaveChat(ctx.message.chat.id)

  // Using context shortcut
  ctx.leaveChat()
})

bot.on('text', async (ctx) => {
  console.log(ctx.message);

  const { from, forward_from, text, chat, forward_sender_name, forward_date, date } = ctx.message;

  if (!forward_from && !forward_sender_name) {
    ctx.reply('Вы должны переслать сообщение от автора отзыва')
    return
  }

  const recipientUsername = formatUsername(from.username);
  const recipientDisplayName = formatDisplayName(from.first_name, from.last_name, from.username);
  const recipientAvatarUrl = await getUserAvatarUrl(from.id) || getFakeAvatarUrl(recipientDisplayName);

  let authorDisplayName = 'Unknown User';
  let authorUsername;
  let authorAvatarUrl;

  if (forward_from) {
    authorUsername = formatUsername(forward_from.username);
    authorDisplayName = formatDisplayName(forward_from.first_name, forward_from.last_name, forward_from.username);
    authorAvatarUrl = await getUserAvatarUrl(forward_from.id);
  } else if (forward_sender_name) {
    authorDisplayName = truncate(forward_sender_name, AUTHOR_DISPLAY_NAME_MAX_LENGTH);
  }

  if (!authorAvatarUrl) {
    authorAvatarUrl = getFakeAvatarUrl(authorDisplayName);
  }

  moment.locale('ru');
  const dateString = forward_date ? moment.unix(forward_date).format('DD.MM.YYYY.') : '';

  const { slug } = saveReview({
    text,
    sender: {
      firstName: forward_from?.first_name || forward_sender_name,
      lastName: forward_from?.last_name,
      username: authorUsername,
      avatar: await imageToBase64(authorAvatarUrl)
    },
    recipient: {
      firstName: from?.first_name,
      lastName: from?.last_name,
      username: recipientUsername,
      avatar: await imageToBase64(recipientAvatarUrl)
    },
    forwardedAt: date,
    sentAt: forward_date || date,
    source: 'telegram',
    originalData: ctx.message
  });

  const verificationLink = getVerificationLink(slug);

  const tempImagePath = `./${uuidv4()}.png`
  const html = await generateHtml('templates/default.html', {
    text: truncate(text, TEXT_MAX_LENGTH),
    author_name: authorDisplayName,
    author_username: authorUsername || '',
    date: dateString,
    avatar_url: authorAvatarUrl,
    verification_link: verificationLink
  }, ['Roboto-Light', 'Roboto-Medium']);
  // await fs.writeFileSync('output.html', html);

  await nodeHtmlToImage({
    output: tempImagePath,
    html
  })
  console.log(`The image was created successfully: ${tempImagePath}`)

  await ctx.replyWithPhoto({ source: tempImagePath })
  console.log(`Created image sent to chat: ${chat.id}`)

  await fs.unlinkSync(tempImagePath);
  console.log('Temp image file removed')

  await ctx.reply(verificationLink);
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

const getVerificationLink = (slug: string): string => {
  return `http://localhost:55607/r/${slug}`
}

const truncate = (str: string, limit: number) => {
  return str.length > limit ?
    str.slice(0, limit).concat('...') :
    str
}

const generateHtml = async (template: string, attributes: any, fonts?: SupportedFont[]): Promise<string> => {
  let html = fs.readFileSync(template, 'utf8').toString();

  for (const key of Object.keys(attributes)) {
    html = html.replace(`{{${key}}}`, attributes[key])
  }

  if (fonts) {
    const font2base64 = require('node-font2base64');
    let fontFaces = '';
    for (const font of fonts) {
      const desc = FontFaceDescriptors[font];
      const fontData = await font2base64.encodeToDataUrl(desc.src);
      fontFaces = fontFaces.concat(
        `@font-face {
          font-family: '${desc.fontFamily}';
          font-weight: ${desc.fontWeight};
          src: url(${fontData}) format('${desc.format}');
        }\n`
      )
    }
    html = html.replace(`{{font_faces}}`, fontFaces)
  }

  return html;
}

const getUserAvatarUrl = async (userId: number): Promise<string | undefined> => {
  const profilePhotos = await telegram.getUserProfilePhotos(userId);
  if (profilePhotos.total_count > 0) {
    const fileId = profilePhotos.photos[0][0].file_id;
    const file = await telegram.getFile(fileId);
    const filePath = file.file_path;
    return `https://api.telegram.org/file/bot${token}/${filePath}`
  }
}

const getFakeAvatarUrl = (displayName: string): string => {
  return `https://avatar.oxro.io/avatar.svg?name=${encodeURIComponent(displayName)}&fontSize=60&width=157&height=157`
}

const imageToBase64 = async (imageUrl: string) => {
  return fetch(imageUrl)
    .then((r) => r.arrayBuffer())
    .then((buf) => `data:image/png;base64,` + Buffer.from(buf).toString('base64'));
}

const formatUsername = (username: string | undefined) => {
  return username && `@${username}`;
}

const formatDisplayName = (
  firstName: string | undefined,
  lastName: string | undefined,
  username: string | undefined
): string => {
  if (firstName && lastName) {
    const displayName = `${firstName} ${lastName}`
    if (displayName.length > AUTHOR_DISPLAY_NAME_MAX_LENGTH) {
      const truncatedFirstName = truncate(firstName, AUTHOR_DISPLAY_NAME_MAX_LENGTH);
      const shortenLastName = lastName.charAt(0);
      return `${truncatedFirstName} ${shortenLastName}.`
    }
  } else if (firstName) {
    return truncate(firstName, AUTHOR_DISPLAY_NAME_MAX_LENGTH);
  } else if (lastName) {
    return truncate(lastName, AUTHOR_DISPLAY_NAME_MAX_LENGTH);
  }
  return username || 'Undefined User';
}

export default bot;
