function main(item) {
    const getNetwork = () => {
        const res = fetch('https://myip.ipip.net/');
        const fields = res.body.split("：");
        if (fields.length == 3) {
            const group = fields[2].replace("\n", "").split(" ");
            return { region: group[1], network: group[group.length - 1] }
        }
        return null;
    }
    const field = getNetwork();
    if (!field.region || !field.network) {
        return {
            error: '未知网络区域，无法匹配节目源！'
        };
    }

    let res;
    const code = field.region + field.network;
    switch (code) {
        case '湖北移动':
            res = fetch('https://raw.githubusercontent.com/360060316/iptv/refs/heads/main/%E6%B9%96%E5%8C%97%E7%A7%BB%E5%8A%A8.json');
            break;
        case '广东联通':
            res = fetch('https://raw.githubusercontent.com/360060316/iptv/refs/heads/main/%E5%B9%BF%E4%B8%9C%E8%81%94%E9%80%9A.json');
            break;
        case '湖南移动':
            res = fetch('https://raw.githubusercontent.com/360060316/iptv/refs/heads/main/%E6%B9%96%E5%8D%97%E7%A7%BB%E5%8A%A8.json');
            break;
        default:
            return {
                error: '暂未适配该地区节目源，请等后续更新！'
            };
    }

    if (!res.ok) {
        return {
            error: '网络连接失败，可能需要节点才能访问！'
        };
    }

    const channels = [];
    for (const channel of res.body) {
        const index = channels.findIndex((obj, idx) => obj.name === channel.name);
        if (index != -1) {
            channels[index].seasons[0].episodes[0].links.push({ url: channel.url });
        } else {
            const field = {
                name: channel.name,
                seasons: [
                    {
                        episodes: [
                            {
                                links: [
                                    {
                                        url: channel.url
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            if (channel.logo) {
                field.logo = channel.logo;
            }

            channels.push(field);
        }
    }

    if (channels.length == 0) {
        return {
            error: '未获取到有效节目！'
        };
    }

    return {
        groups: [{
            name: code,
            channels: channels
        }]
    };
}