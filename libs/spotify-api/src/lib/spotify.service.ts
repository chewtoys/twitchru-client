import { PrismaService } from '@dream/prisma';
import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as querystring from 'querystring';

@Injectable()
export class SpotifyService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private readonly config: ConfigService
  ) {}

  async getToken(userId: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { userId },
    });

    return profile?.accessToken || '';
  }

  async refreshToken(userId: string) {
    const profile = await this.prisma.profile.findFirst({
      where: { userId, provider: 'spotify' },
    });

    const { refreshToken } = profile;

    const { clientID, clientSecret } = this.config.get('authSpotify');
    const token = Buffer.from(clientID + ':' + clientSecret).toString('base64');

    const res = await this.httpService
      .post(
        'https://accounts.spotify.com/api/token',
        querystring.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
        {
          headers: {
            // <base64 encoded client_id:client_secret>
            Authorization: `Basic ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      .toPromise();

    const accessToken = res?.data?.access_token;

    if (!accessToken) {
      throw new Error('fail');
    }

    await this.prisma.profile.update({
      where: { id: profile.id },
      data: { accessToken },
    });

    return accessToken;
  }
}
