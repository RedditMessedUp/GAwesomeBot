const memes = require("./../../Configuration/memes.json");
const base64 = require("node-base64-image");

module.exports = (bot, db, config, winston, userDocument, serverDocument, channelDocument, memberDocument, msg, suffix) => {
	this.getRandomMeme = () => {
		return memes[Math.floor(Math.random() * memes.length)];
	};

	this.generateCustomMeme = (meme, topText, botText) => {
		topText = topText || "";
		botText = botText || "";

		meme = meme.replace(/&/g, "").trim();

		// sometimes, empty string does not clear the default
		// "TOP TEXT" and "BOTTOM TEXT" from apimeme, so use space
		topText = topText.replace(/&/g, "").trim() || "+";
		botText = botText.replace(/&/g, "").trim() || "+";

		meme = encodeURI(meme);
		topText = encodeURI(topText);
		botText = encodeURI(botText);

		const uri = `http://apimeme.com/meme?meme=${meme}&top=${topText}&bottom=${botText}`;
		base64.encode(uri, { filename: "meme.jpg" }, (error, image) => {
			if(!error) {
				msg.channel.createMessage("", {
					file: image,
					name: "meme.jpg"
				});
			}
			else {
				msg.channel.createMessage(uri);
			}
		});
	};

	this.search = query => {
		query = query || "";
		query = query.trim().toLowerCase();

		if(query.length == 0) {
			msg.channel.createMessage("No keywords given for search");
		}

		const matches = [];
		const max_results = serverDocument.config.command_fetch_properties.default_count;
		const keywords = query.split(/\s+/), keywords_length = keywords.length;

		for(let m = 0, len = memes.length; m < len; m++) {
			const meme = memes[m].toLowerCase();
			let keywords_matched = 0;

			for(let k = 0; k < keywords_length; k++) {
				if(!~meme.indexOf(keywords[k])) {
					break;
				}
				keywords_matched++;
			}

			if(keywords_matched == keywords_length) {
				matches.push(memes[m]);
			}

			if(matches.length >= max_results) {
				break;
			}
		}

		// has results?
		if(matches.length) {
			msg.channel.createMessage(`Top ${matches.length} matches:\n\t${matches.join("\n\t")}`);
		}
		else {
			msg.channel.createMessage("No matches found. Try a different search.");
		}
	};

	if(!suffix.length) {
		msg.channel.createMessage("Please provide some text to go on the meme picture.");
		return;
	}

	const subparams = suffix.split(" ");
	if(subparams.length) {
		const subcommand = subparams[0].toLowerCase();
		switch(subcommand) {
			case "search":
				subparams.shift();
				this.search(subparams.join(" "));
				return;
		}
	}

	const params = suffix.split("|");
	switch(params.length) {
		case 1:
			this.generateCustomMeme(this.getRandomMeme(), params[0]);
			break;
		case 2:
			this.generateCustomMeme(this.getRandomMeme(), params[0], params[1]);
			break;
		case 3:
			this.generateCustomMeme(params[0], params[1], params[2]);
			break;
	}
};
