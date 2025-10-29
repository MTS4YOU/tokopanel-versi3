export const pterodactylConfig = {
  domain: "https://servnov64-private14.serverpanel.store",
  apiKey: "ptla_I1Uizztlp5b4g1MuFVfd04QOwI5SyLMzzJjPgIUujPL",
  nests: "5",
  nestsGame: "2", // ga ubah di isi, ga perlu
  egg: "15",
  eggSamp: "16", // ga ubah di isi, ga perlu
  location: "1", // location panel 
}

export const appConfig = {
  whatsappGroupLink: "", // link group
  nameHost: "MTS4YOU TOKO PANEL", // nama host 
  feeMin: 10, //minimal fee
  feeMax: 50, // max fee 
  pay: {
    api_id: "3c8e1389f124",
    api_key: "2ee8e987299204903aaf74cf24ddabe6345db043",
  },
  emailSender: {
    host: "okfajri45@gmail.com", // Gmail host
    port: 587, // ga usa di ubah, ga guna 
    secure: false, // false in
    auth: {
      user: "", // Gmail buat ngirim ke Gmail buyer 
      pass: "", // sandi aplikasi 
    },
    from: "Kurir Panel <okfajri45@gmail.com>",
  }, // ganti sendiri 
  telegram: {
    botToken: "",
    ownerId: "",
  },
  mongodb: {
       uri: "mongodb+srv://zassxd:ardyjb111@zpay.1jst3iw.mongodb.net/?retryWrites=true&w=majority&appName=zpay", // url mongo mu
    dbName: "zpay",
  },
  okeconnect: {
    codeqr: "", 
    merchant: "",
    apikey: ""
  },
  socialMedia: {
    whatsapp: "https://wa.me/6283894064758",
    tiktok: "https://xnxx.com",
    instagram: "https://www.intagram.com/only48966"
  }
}
