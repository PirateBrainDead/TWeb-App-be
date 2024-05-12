export type NotificationData = {
  title: string;
  body: string;
};

export interface Message {
  notification: NotificationData;
  tokens: string[];
  apns?: {
    payload: {
      aps: {
        sound: string;
      };
    };
  };
}
