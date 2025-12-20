import IUser from '../../utils/interfaces/IUser';

export default interface IMailServices {
	email_address: string;
	user: IUser;
	sender: string;
}

export interface ISendInviteServices {
	sender: string;
	url: string;
}
