var allProviders = [
    {id: 'btfs', disp: 'BTFS', dht: 1, logo: 'ipfs.png'},
    {id: 'ipfs', disp: 'IPFS', dht: 1, logo: 'ipfs.png'},
    {id: 'sia', disp: 'Skynet', dht: 1, logo: 'sia.svg'},
    {id: 'twitch', disp: 'Twitch', logo: 'twitch.png'},
    {id: 'youtube', disp: 'YouTube', logo: 'youtube.png'},
    {id: 'dailymotion', disp: 'Dailymotion', logo: 'dailymotion.webp'},
    {id: 'instagram', disp: 'Instagram', logo: 'instagram.png'},
    {id: 'liveleak', disp: 'LiveLeak', logo: 'liveleak.png'},
    {id: 'vimeo', disp: 'Vimeo', logo: 'vimeo.png'},
    {id: 'facebook', disp: 'Facebook', logo: 'facebook.png'},
]
Providers = {
    all: function() {
        return allProviders
    },
    all3p: function() {
        var providers = []
        for (let i = 0; i < allProviders.length; i++) {
            if (allProviders[i].dht) continue
            providers.push(allProviders[i])
        }
        return providers
    },
    idToDisp: function(id) {
        for (let i = 0; i < allProviders.length; i++)
            if (allProviders[i].id == id)
                return allProviders[i].disp
        return
    },
    dispToLogo: function(disp) {
        for (let i = 0; i < allProviders.length; i++)
        if (allProviders[i].disp == disp)
            return allProviders[i].logo
    },
    dispToId: function(disp) {
        for (let i = 0; i < allProviders.length; i++)
        if (allProviders[i].disp == disp)
            return allProviders[i].id
    return
    },
    getDefaultGateway: function(video) {
        if (provider == 'IPFS' && video && video.files && video.files.ipfs && video.files.ipfs.gw)
            return video.files.ipfs.gw
        if (provider == 'BTFS' && video && video.files && video.files.btfs && video.files.btfs.gw)
            return video.files.btfs.gw
        if (provider == 'IPFS') return portals.IPFS[0]
        if (provider == 'BTFS') return portals.BTFS[0]
        if (provider == 'Skynet') return portals.Skynet[0]
        return
    },
    getFallbackGateway: function() {
        if (provider == 'IPFS') return portals.IPFS[1]
        if (provider == 'BTFS') return portals.BTFS[1]
        if (provider == 'Skynet') return portals.Skynet[1]
    },
    available: function(video) {
        if (!video) return []
        var provs = []
        if (video.files) {
            for (let i = 0; i < allProviders.length; i++) {
                if (
                    video.files[allProviders[i].id] &&
                    video.files[allProviders[i].id].vid &&
                    Object.keys(video.files[allProviders[i].id].vid).length > 0
                ) {
                    provs.push(allProviders[i].disp)
                } else {
                    if (video.files[allProviders[i].id] && !allProviders[i].dht)
                        provs.push(allProviders[i].disp)
                }
            }
        }
        if (video.providerName && provs.indexOf(video.providerName) == -1) 
            provs.push(video.providerName)
        return provs
    },
    default: function(video) {
        if (video && video.providerName) return video.providerName
        if (video && video.files) {
            for (let i = 0; i < allProviders.length; i++) {
                if (allProviders[i].dht == 1) {
                    if (
                        video.files[allProviders[i].id] &&
                        video.files[allProviders[i].id].vid &&
                        Object.keys(video.files[allProviders[i].id].vid).length > 0
                    ) {
                        return allProviders[i].disp
                    }
                } else {
                    if (video.files[allProviders[i].id])
                        return allProviders[i].disp
                }
            }
        }
        return 'IPFS'
    }
}