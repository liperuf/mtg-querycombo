import { google } from  'googleapis'


async function main() {

	const auth = new google.auth.GoogleAuth({
		keyFile: "helical-element-163523-43026536e52b.json",
		scopes: "https://www.googleapis.com/auth/spreadsheets"
	})

	const authClientObject = await auth.getClient()

	const googleSheetInstance = google.sheets({
		version: 'v4',
		auth: authClientObject
	})

	const spreadsheetId = "1KqyDRZRCgy8YgMFnY0tHSw_3jC99Z0zFvJrPbfm66vA"

	const readData = await googleSheetInstance.spreadsheets.values.get({
		auth,
		spreadsheetId,
		range: "combos!A2:Q"
	})

	console.log(readData.data)

}

main()