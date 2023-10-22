const Speech = require("../model/speechModel")
const gtts = require('gtts');
const fs = require('fs');
const path = require('path');
const publicDirectory = path.join(__dirname, '../../speech');

exports.speechData = async (req, res) => {
    const reqBody = req.body
    const { text, language } = reqBody

    if (!text)
        return res.send({ responseCode: 200, success: false, responseMessage: 'Text input is required' });


    // Create a new instance of gtts with the specified language
    const tts = new gtts(text, language || 'en');

    // Generate the speech as an audio buffer and save it to a temporary file
    const audioFileName = `speech_${Date.now()}.mp3`;
    const audioFilePath = path.join(publicDirectory, audioFileName);

    tts.save(audioFilePath, async (err, data) => {
        if (err) {
            return res.send({ responseCode: 200, success: false, responseMessage: 'Error generating speech ' + err.message });
        }

        // Save the audio file path to the database

        try {
            const speech = new Speech({
                text,
                language: language || 'en',
                audioPath: audioFilePath,
            });

            await speech.save();
        } catch (err) {
            return res.send({ responseCode: 400, responseMessage: error.message })
        }

        res.send({ responseCode: 200, success: true, responseMessage: 'Speech generated and saved successfully', responseResult: audioFileName });
    });

}