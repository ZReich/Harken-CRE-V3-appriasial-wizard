import {
	FORGOT_PW_URL,
	SENDER_MAIL_ID,
	SENDER_KEY,
	CREATE_PW_URL,
	MAIL_DEFAULT,
	ENVIRONMENT,
	SEND_INVITE_URL,
} from '../../env';
import nodemailer from 'nodemailer';
import mjml2html from 'mjml';
import TokenTypeEnum from '../../utils/enums/TokenTypeEnum';
import AuthStore from '../auth/auth.store';
import { MailEnum } from '../../utils/enums/MessageEnum';
import IUser from '../../utils/interfaces/IUser';
import { getCurrentYear } from '../../utils/common/Time';
import IMailServices, { ISendInviteServices } from './IMailSevices';
import postmarkTransport from 'nodemailer-postmark-transport';
import DefaultEnum, { LoggerEnum } from '../../utils/enums/DefaultEnum';
import { ICreateAccountOptinRequest } from '../accountOptin/IAccountsOptinService';
import AccountsStore from '../accounts/accounts.store';
import HelperFunction from '../../utils/common/helper';
const helperFunction = new HelperFunction();
export default class MailService {
	private storage = new AuthStore();
	private accountStorage = new AccountsStore();
	public sender_id: string;
	public transporter;

	constructor(sender_id = SENDER_MAIL_ID) {
		this.sender_id = sender_id;
		// Create transporter
		this.transporter = nodemailer.createTransport(
			postmarkTransport({
				auth: {
					apiKey: SENDER_KEY, // Postmark server token
				},
			}),
		);
	}

	/**
	 * @description function for send forgot password mail to user
	 * @param email
	 * @param user
	 */
	async sendMailToUser(email_address: string, user: IUser): Promise<void> {
		const token = await this.createToken(user.id, TokenTypeEnum.FORGOTTEN_PASSWORD);
		// Create url for reset password
		const url = FORGOT_PW_URL + token;
		// Define your HTML template directly
		const htmlTemplate = await mjml2html(await this.forgotPasswordContent(user, url));

		let to = email_address;
		// Send mail to default mail if enviornment is development
		if (ENVIRONMENT === DefaultEnum.DEVELOPMENT) {
			to = MAIL_DEFAULT;
		}
		// Define email options
		const mailOptions = {
			from: this.sender_id,
			to: to,
			subject: MailEnum.FORGOT_PASSWORD_SUBJECT,
			html: htmlTemplate.html, // Use the html property of the converted MJML template
		};

		// Send email
		this.transporter.sendMail(mailOptions, function (error, info) {
			if (error) {
				console.error('Error sending email:', error);
			} else {
				console.log('Email sent:', info.response);
			}
		});
	}

	/**
	 * @description function for create token
	 * @param id
	 * @param type
	 * @returns
	 */
	async createToken(id, type) {
		const token: string = await this.storage.insertToken(id, type); // Call the insertToken function from users_model
		// const qstring: string = await Buffer.from(token).toString('base64').replace(/=/g, ''); // Base64 encode the token
		return token;
	}

	/**
	 * @description Function for create forgot password content
	 * @param user
	 * @param url
	 * @returns
	 */
	async forgotPasswordContent(user: IUser, url: string) {
		return `<mjml>
        <mj-head>
          <mj-attributes>
            <mj-all font-family="Arial, 'Helvetica Neue', Helvetica, sans-serif"></mj-all>
            <mj-body background-color="#F2F4F6" color="#74787E"></mj-body>
            <mj-text font-size="16px" line-height="1.4"></mj-text>
            <mj-section padding="25px 0"></mj-section>
            <mj-class name="button" background-color="#0DA1C7" border-top="10px solid #0DA1C7" border-right="18px solid #0DA1C7" border-bottom="10px solid #0DA1C7" border-left="18px solid #0DA1C7" display="inline-block" color="#FFF" text-decoration="none" border-radius="3px" box-shadow="0 2px 3px rgba(0, 0, 0, 0.16)" -webkit-text-size-adjust="none"></mj-class>
            <mj-class name="button--blue" background-color="#0DA1C7" border-top="10px solid #0DA1C7" border-right="18px solid #0DA1C7" border-bottom="10px solid #0DA1C7" border-left="18px solid #0DA1C7"></mj-class>
          </mj-attributes>
          <mj-style>
            .align-right { text-align: right; }
            .align-left { text-align: left; }
            .align-center { text-align: center; }
          </mj-style>
        </mj-head>
        <mj-body background-color="#F2F4F6">
          <mj-section padding="25px 0" background-color="#F2F4F6" text-align="center">
            <mj-column>
              <mj-image src="https://app.harkencre.com/assets/img/logo-black@2x.png" alt="Harken CRE Logo" width="94px"></mj-image>
            </mj-column>
          </mj-section>
          <mj-section padding="35px" border-top="1px solid #EDEFF2" border-bottom="1px solid #EDEFF2" background-color="#FFFFFF">
            <mj-column>
              <mj-text font-size="19px" font-weight="bold" color="#2F3133" align="left">Hi ${user.first_name} </mj-text>
              <mj-text font-size="16px" color="#74787E" align="left">You recently requested to reset your password for your Harken CRE account. Use the button below to reset it. <strong>This password reset is only valid for the next 24 hours.</strong></mj-text>
              <mj-button href="${url}" background-color="#0DA1C7" align="center" width="100%" padding="15px 30px" font-size="16px" color="#FFF" text-decoration="none" border-radius="3px" box-shadow="0 2px 3px rgba(0, 0, 0, 0.16)" -webkit-text-size-adjust="none">Reset your password</mj-button>
              <mj-text font-size="16px" color="#74787E" align="left" padding-top="20px">If you did not request a password reset, please ignore this email.</mj-text>
              <mj-text font-size="16px" color="#74787E" align="left" padding-top="20px">Thanks,<br/>Harken CRE Support Team</mj-text>
              <mj-text font-size="12px" color="#74787E" align="left" padding-top="20px">If you’re having trouble with the button above, copy and paste the URL below into your web browser.</mj-text>
              <mj-text font-size="12px" color="#74787E" align="left">${url}</mj-text>
            </mj-column>
          </mj-section>
          <mj-section padding="15px 0" background-color="#F2F4F6" text-align="center">
            <mj-column>
              <mj-text font-size="12px" color="#AEAEAE" align="center">&copy; ${getCurrentYear()} Harken CRE. All rights reserved.</mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>`;
	}

	/**
	 * @description Function for send mail for set password to new user
	 * @param data
	 * @returns
	 */
	async sendSetPasswordEmail(data: IMailServices) {
		const { user, email_address } = data;
		const token = await this.createToken(user.id, TokenTypeEnum.NEW_PASSWORD);
		const url = CREATE_PW_URL + token;
		const htmlTemplate = await this.setPasswordEmailContent(data, url);

		let to = email_address;
		// Send mail to default mail if enviornment is development
		if (ENVIRONMENT === DefaultEnum.DEVELOPMENT) {
			to = MAIL_DEFAULT;
		}
		const mailOptions = {
			from: this.sender_id,
			to: to,
			subject: MailEnum.SETTING_PASSWORD,
			html: htmlTemplate.html,
		};

		try {
			const info = await this.transporter.sendMail(mailOptions);
			console.log('Email sent:', info.response);
		} catch (error) {
			//logging error
			helperFunction.log({
				message: error.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: error,
			});
			console.error('Error sending email:', error);
		}
	}

	async setPasswordEmailContent(data: IMailServices, url: string) {
		const { sender, user } = data;
		const mjmlTemplate = `
			<mjml>
				<mj-head>
					<mj-title>${sender} invited you to Harken CRE</mj-title>
					<mj-attributes>
						<mj-all font-family="Arial, 'Helvetica Neue', Helvetica, sans-serif" />
					</mj-attributes>
					<mj-style>
						.email-wrapper {
							width: 100%;
							margin: 0;
							padding: 0;
							background-color: #F2F4F6;
						}
						.email-content {
							width: 100%;
							margin: 0;
							padding: 0;
							background-color: #F2F4F6;
						}
						.email-body {
							width: 100%;
							margin: 0;
							padding: 0;
							border-top: 1px solid #EDEFF2;
							border-bottom: 1px solid #EDEFF2;
							background-color: #FFFFFF;
						}
						.email-body_inner {
							width: 570px;
							margin: 0 auto;
							padding: 0;
							background-color: #FFFFFF;
						}
						.email-footer {
							width: 570px;
							margin: 0 auto;
							padding: 0;
							text-align: center;
						}
						.content-cell {
							padding: 35px;
						}
						.body-action {
							margin: 30px auto;
							text-align: center;
						}
						.body-sub {
							margin-top: 25px;
							padding-top: 25px;
							border-top: 1px solid #EDEFF2;
						}
						.preheader {
							display: none !important;
							visibility: hidden;
							font-size: 1px;
							line-height: 1px;
							max-height: 0;
							max-width: 0;
							opacity: 0;
							overflow: hidden;
						}
					</mj-style>
				</mj-head>
				<mj-body>
					<mj-section>
						<mj-column>
							<mj-text align="center">
								<mj-image src="https://app.harkencre.com/assets/img/logo-black@2x.png" height="50" />
							</mj-text>
						</mj-column>
					</mj-section>
					<mj-section>
						<mj-column>
							<mj-text>
								<h1>Hi, ${user.first_name}</h1>
								<p>${sender} has invited you to use Harken CRE to collaborate with them. Use the button below to set up your account and get started:</p>
							</mj-text>
							<mj-button href="${url}" align="center">Set up password</mj-button>
							<mj-text>
								<p>Welcome aboard,</p>
								<p>Harken CRE</p>
							</mj-text>
							<mj-text>
								<p>If you’re having trouble with the button above, copy and paste the URL below into your web browser.</p>
								<p>${url}</p>
							</mj-text>
						</mj-column>
					</mj-section>
					<mj-section>
						<mj-column>
							<mj-text align="center">
								<p>&copy; ${new Date().getFullYear()} Harken CRE. All rights reserved.</p>
							</mj-text>
						</mj-column>
					</mj-section>
				</mj-body>
			</mjml>
		`;
		return mjml2html(mjmlTemplate);
	}

	/**
	 * @description Function for send mail for send invite to broker
	 * @param data
	 * @returns
	 */
	async sendInviteEmail(data: ICreateAccountOptinRequest) {
		const { token, account_id, email_address } = data;
		const url = SEND_INVITE_URL + token;
		const findAccount = await this.accountStorage.findByAttribute({
			id: account_id,
			is_deleted: 0,
		});

		let sender: string = DefaultEnum.HARKEN;
		if (findAccount) {
			sender = findAccount.name;
		}
		const mailData = {
			url,
			sender,
		};
		const htmlTemplate = await this.setSendInviteEmailContent(mailData);

		let to = email_address;
		// Send mail to default mail if enviornment is development
		if (ENVIRONMENT === DefaultEnum.DEVELOPMENT) {
			to = MAIL_DEFAULT;
		}
		const mailOptions = {
			from: this.sender_id,
			to: to,
			subject: MailEnum.SEND_INVITE_SUBJECT,
			html: htmlTemplate.html,
		};

		try {
			const info = await this.transporter.sendMail(mailOptions);
			console.log('Email sent:', info.response);
		} catch (error) {
			//logging error
			helperFunction.log({
				message: error.message,
				location: await helperFunction.removeSubstring(__dirname, __filename),
				level: LoggerEnum.ERROR,
				error: error,
			});
			console.error('Error sending email:', error);
		}
	}

	/**
	 * @description Function to create send invite mail content
	 * @param data
	 * @returns
	 */
	async setSendInviteEmailContent(data: ISendInviteServices) {
		const { sender, url } = data;
		const mjmlTemplate = `<mjml>
				<mj-head>
				<mj-attributes>
					<mj-all font-family="Arial, 'Helvetica Neue', Helvetica, sans-serif" />
					<mj-text color="#74787E" font-size="16px" line-height="1.5em" />
				</mj-attributes>
				<mj-style>
					.button {
					background-color: #0DA1C7;
					color: white !important;
					display: inline-block;
					text-decoration: none;
					border-radius: 3px;
					padding: 15px 20px;
					font-weight: bold;
					box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
					}
					.body-sub {
					margin-top: 25px;
					padding-top: 25px;
					border-top: 1px solid #EDEFF2;
					}
				</mj-style>
				</mj-head>
				<mj-body background-color="#F2F4F6">
				<mj-section>
					<mj-column>
					<mj-image width="94px" src="https://app.harkencre.com/assets/img/logo-black@2x.png"/>
					</mj-column>
				</mj-section>
				<mj-section background-color="#FFFFFF">
					<mj-column>
					<mj-text font-size="19px" font-weight="bold">Hi,</mj-text>
					<mj-text>
						${sender} has invited you to use Harken CRE to collaborate with them. Use the button below to get started:
					</mj-text>
					<mj-button href="${url}" align="center" background-color="#0DA1C7" color="white">Accept Invitation</mj-button>
					<mj-text>
						Welcome aboard,<br/>
						Harken CRE
					</mj-text>
					<mj-divider border-color="#EDEFF2" padding="15px 0" />
					<mj-text class="body-sub">
						If you’re having trouble with the button above, copy and paste the URL below into your web browser:<br/>
						${url}
					</mj-text>
					</mj-column>
				</mj-section>
				<mj-section background-color="#EDEFF2" padding="24px">
					<mj-column>
					<mj-text align="center" color="#74787E" font-size="15px">
						&copy; ${new Date().getFullYear()} Harken CRE. All rights reserved.
					</mj-text>
					</mj-column>
				</mj-section>
				</mj-body>
			</mjml>
	  	`;
		return mjml2html(mjmlTemplate);
	}
}
