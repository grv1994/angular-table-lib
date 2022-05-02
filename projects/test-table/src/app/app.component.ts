import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'test-table';
  dataSource: any[] = [];
  columnDef: any[] = [
    {
      header: 'Good To Trade',
      field: 'Good To Trade'
    },
    {
      header: 'Counterparty',
      field: 'Counterparty'
    },
    {
      header: 'Repo Type',
      field: 'Repo Type'
    },
    {
      header: 'Side',
      field: 'Side'
    },
    {
      header: 'Available Cash Settlement Amount',
      field: 'Available Cash Settlement Amount'
    },
    {
      header: 'Cash Settlement Currency',
      field: 'Cash Settlement Currency'
    },
    {
      header: 'Rate/Spread Over Benchmark',
      field: 'Rate/Spread Over Benchmark'
    },
    {
      header: 'Floating',
      field: 'Floating'
    },
    {
      header: 'Purchasing Date',
      field: 'Purchasing Date'
    },
    {
      header: 'Repurchase Date',
      field: 'Repurchase Date'
    },
    {
      header: 'Repo Term Type',
      field: 'Repo Term Type'
    },
    {
      header: 'Market Sector',
      field: 'Market Sector'
    },
    {
      header: 'Issuer Domicile',
      field: 'Issuer Domicile'
    },
    {
      header: 'Quality',
      field: 'Quality'
    },
    {
      header: 'Collaterals',
      field: 'Collaterals'
    },
  ];
  constructor(private _decimalPipe: DecimalPipe){}

  async ngOnInit(){
    this.getAllData();
  }

  onGridReady(event: any) {
    console.log("event", event);
  }

  getAllData(){
    DATA.forEach(data => {
      let gridData = {
        'Good To Trade': data.goodToTrade ? 'YES' : 'NO',
        'Counterparty': data.requestCreatorCompanyName || '-',
        'Repo Type': data.productType || '-',
        'Side': data?.offerBidType === 'O' ? 'Repo' : 'Reverse Repo',
        'Available Cash Settlement Amount': this._decimalPipe.transform(data.amount, '0.0-3') + ' Mio',
        'Cash Settlement Currency': data.currency,
        'Rate/Spread Over Benchmark': data.rate + '%',
        'Floating': data?.rateType === 'FLOAT' ? '' : '-',
        'Purchasing Date': data.purchaseDate,
        'Repurchase Date': data.repurchaseDate || '-',
        'Repo Term Type': data.requestType === 'STANDARD' ? data.requestType + ' - ' + data.term : data.requestType?.replace('_', ' '),
        'Market Sector': data.marketSector?.length ? data.marketSector.join(', ') : '-',
        'Issuer Domicile': data.issuerDomicile?.length ? data.issuerDomicile.join(', ') : '-',
        'Quality': data.quality?.length ? data.quality.join(', ') : '-',
        'Collaterals': data.offerBidType === 'B' ? data.collateral?.length ? data.collateral.map(collateral => collateral.isin).join(', ') : '-' : data.selectedCollaterals?.length ? data.selectedCollaterals.map((selectedCollaterals: any) => selectedCollaterals.isin).join(', ') : '-',
        'hideAction': true,
        'hideEditAction': true,
        'canInitiate': true,
        'id': data._id,
      };
      this.dataSource.push(gridData);
    })
  }
}

export const DATA = [
  {
      "_id": "626a3a99db16d7293909e84c",
      "marketType": "Repo",
      "quoteType": "NORMAL",
      "productType": "BILATERAL",
      "rateType": "FIXED",
      "collateral": [],
      "marketSector": [],
      "issuerDomicile": [],
      "quality": [],
      "status": "LIVE",
      "requestedCompanies": [],
      "isChatRequest": false,
      "platform": "Instimatch",
      "selectedCollaterals": [],
      "offerBidType": "B",
      "requestType": "STANDARD",
      "purchaseDate": "29.04.2022",
      "currency": "USD",
      "amount": 121,
      "frequencyOfReset": null,
      "frequencyOfResetUnit": "M",
      "collateralType": "BROAD",
      "crossCcy": true,
      "ros": true,
      "requestTimeout": 15,
      "repurchaseDate": "02.05.2022",
      "term": "T/N",
      "callableType": "T1",
      "rate": 2,
      "haircut": 0,
      "counterRates": [],
      "callable": true,
      "requestCreatorUser": "62171b64a97f75076b9106e9",
      "requestCreatorCompany": "62171b64a97f75076b9106dd",
      "purchaseDateStamp": "2022-04-29T00:00:00.000Z",
      "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
      "createdAt": "2022-04-28T06:56:25.705Z",
      "updatedAt": "2022-04-28T06:56:25.705Z",
      "__v": 0,
      "requestCreatorCompanyName": "Blue Bank"
  },
  {
      "_id": "626a37463e1ec9040f867677",
      "marketType": "Repo",
      "quoteType": "NORMAL",
      "productType": "BILATERAL",
      "rateType": "FIXED",
      "collateral": [
          {
              "id": 0,
              "itemName": "BE6271706747, Belgium, 2.875%, 2024-09-18",
              "isin": "BE6271706747",
              "currency": "USD",
              "couponInPercentage": "2.875",
              "maturityDate": "2024-09-18",
              "issuerDomicile": "Belgium",
              "_id": "626a126f9e5f001db78f5f27"
          },
          {
              "id": 1,
              "itemName": "BE6322164920, Belgium, 1%, 2030-05-28",
              "isin": "BE6322164920",
              "currency": "USD",
              "couponInPercentage": "1",
              "maturityDate": "2030-05-28",
              "issuerDomicile": "Belgium",
              "_id": "626a126f9e5f001db78f5f28"
          }
      ],
      "marketSector": [],
      "issuerDomicile": [],
      "quality": [],
      "status": "LIVE",
      "requestedCompanies": [],
      "isChatRequest": false,
      "platform": "Instimatch",
      "selectedCollaterals": [],
      "offerBidType": "B",
      "requestType": "STANDARD",
      "purchaseDate": "29.04.2022",
      "currency": "USD",
      "amount": 121,
      "frequencyOfReset": null,
      "frequencyOfResetUnit": "M",
      "collateralType": "SPECIFIC",
      "crossCcy": false,
      "ros": true,
      "requestTimeout": 15,
      "repurchaseDate": "02.05.2022",
      "term": "T/N",
      "callableType": "T1",
      "rate": "2.000",
      "haircut": 0,
      "counterRates": [],
      "callable": true,
      "requestCreatorUser": "6204c36fa90ddc07b09bdeba",
      "requestCreatorCompany": "6204c36fa90ddc07b09bdeb2",
      "purchaseDateStamp": "2022-04-29T00:00:00.000Z",
      "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
      "createdAt": "2022-04-28T06:42:14.234Z",
      "updatedAt": "2022-04-28T06:42:14.234Z",
      "__v": 0,
      "goodToTrade": true,
      "requestCreatorCompanyName": "CCL"
  },
  {
      "_id": "626a2f8e3e1ec9040f866df3",
      "marketType": "Repo",
      "quoteType": "NORMAL",
      "productType": "BILATERAL",
      "rateType": "FIXED",
      "collateral": [],
      "marketSector": [],
      "issuerDomicile": [],
      "quality": [],
      "status": "LIVE",
      "requestedCompanies": [],
      "isChatRequest": false,
      "platform": "Instimatch",
      "selectedCollaterals": [],
      "offerBidType": "B",
      "requestType": "STANDARD",
      "purchaseDate": "29.04.2022",
      "currency": "USD",
      "amount": 121,
      "frequencyOfReset": null,
      "frequencyOfResetUnit": "M",
      "collateralType": "BROAD",
      "crossCcy": true,
      "ros": true,
      "requestTimeout": 15,
      "repurchaseDate": "02.05.2022",
      "term": "T/N",
      "callableType": "T1",
      "rate": 2,
      "haircut": 0,
      "counterRates": [],
      "callable": true,
      "requestCreatorUser": "62171b64a97f75076b9106e9",
      "requestCreatorCompany": "62171b64a97f75076b9106dd",
      "purchaseDateStamp": "2022-04-29T00:00:00.000Z",
      "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
      "createdAt": "2022-04-28T06:09:18.336Z",
      "updatedAt": "2022-04-28T06:09:18.336Z",
      "__v": 0,
      "requestCreatorCompanyName": "Blue Bank"
  }
]