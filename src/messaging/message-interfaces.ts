export type MessageTypes = 
| 'email'
| 'sms'

export interface IMessage {
    type: MessageTypes,
    email?: IEmail,
    sms?: ISMS
}

export interface IEmail {
    from: string,
    to: string,
    subject?: string,
    content: string
}

export interface ISMS {
    phone: string,
    content: string
}
