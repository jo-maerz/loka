import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface GeocodeResult {
  display_name: string;
  lat: string;
  lon: string;
}

export interface ReverseGeocodeResult {
  display_name: string;
}

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private geocodeUrl = 'https://nominatim.openstreetmap.org/search';
  private reverseGeocodeUrl = 'https://nominatim.openstreetmap.org/reverse';

  constructor(private http: HttpClient) {}

  geocodeAddress(address: string): Observable<GeocodeResult[]> {
    const params = new HttpParams()
      .set('format', 'json')
      .set('q', address)
      .set('addressdetails', '1')
      .set('limit', '1');

    return this.http.get<GeocodeResult[]>(this.geocodeUrl, { params }).pipe(
      map((data) => data),
      catchError((error) => {
        console.error('Geocoding error:', error);
        return throwError('Failed to geocode the address.');
      })
    );
  }

  reverseGeocode(lat: number, lng: number): Observable<string> {
    const params = new HttpParams()
      .set('format', 'jsonv2')
      .set('lat', lat.toString())
      .set('lon', lng.toString());

    return this.http
      .get<ReverseGeocodeResult>(this.reverseGeocodeUrl, { params })
      .pipe(
        map((data) => {
          if (data && data.display_name) {
            return data.display_name;
          } else {
            throw new Error('Address not found.');
          }
        }),
        catchError((error) => {
          console.error('Reverse geocoding error:', error);
          return throwError(
            'Failed to retrieve address from the selected location.'
          );
        })
      );
  }
}
