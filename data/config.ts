export const pterodactylConfig = {
  domain: "https://nasibakar128-publik231.pterodaactyl.biz.id",
  apiKey: "ptla_JttQ4k04IoN0P8kxV4XDDNa0Zimb4WoDmagbU7gqVvK",
  nests: "5", 
  nestsGame: "2", // ga usah di isi, ga perlu
  egg: "15", 
  eggSamp: "16", // ga usah di isi, ga perlu
  location: "1", // location panel 
}

export const appConfig = {
  whatsappGroupLink: "https://whatsapp.com/channel/0029VbBHzkt1t90Z4H55f638", // link group
  nameHost: "MTS4YOU XD", // nama host 
  feeMin: 10, //minimal fee
  feeMax: 50, // max fee 
  garansi: {
    warrantyDays: 12, // Limit hari
    replaceLimit: 1, // Limit replace/claim
  },
  pay: {
    api_key: "KEY-Dq4VmT7PQorsWotGvyczJnsBfcx",
    api_id: "ID-723482138356",
  },
  emailSender: {
    host: "mail.mts4youxd425@gmail.com", // Gmail host
    port: 587, // ga usa di ubah, ga guna 
    secure: false, // false in
    auth: {
      user: "mail.mts4youxd425@gmail.com", // Gmail buat ngirim ke Gmail buyer 
      pass: "joernukccwnrzpww", // sandi aplikasi 
    },
    from: "Tukang Panel <mail.mts4youxd425@gmail.com>",
  }, // ganti sendiri 
  telegram: {
    botToken: "",
    ownerId: "",
  },
  mongodb: {
    uri: "mongodb+srv://zassxd:ardyjb111@zpay.1jst3iw.mongodb.net/?retryWrites=true&w=majority&appName=zpay", // url mongo mu
dbName: "zpay",
  },
  socialMedia: {
    whatsapp: "https://wa.me/6289513452028",
    tiktok: "https://www.tiktok.com/@mts4you.xd",
    instagram: "https://www.instagram.com/ig_mtsstore"
  }
}
