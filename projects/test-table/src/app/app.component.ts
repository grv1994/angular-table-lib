import { Component } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ColumnDefinition } from 'projects/ag-table/src/public-api';
import { DataSource } from 'projects/ag-table/src/lib/types/data-source.type';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'test-table';
  dataSource: DataSource[] = [];
  GoodToTrade: any = '';
  Counterparty: any = '';
  RepoType: any = '';
  Side: any = '';
  AvailableCashSettlementAmount: any = '';
  CashSettlementCurrency: any = '';
  RateSpreadOverBenchmark: any = '';
  Floating: any = '';
  PurchasingDate: any = '';
  RepurchaseDate: any = '';
  RepoTermType: any = '';
  MarketSector: any = '';
  IssuerDomicile: any = '';
  Quality: any = '';
  Collaterals: any = '';
  newDataForm: FormGroup = new FormGroup({
    GoodToTrade: new FormControl(this.GoodToTrade, []),
    Counterparty: new FormControl(this.Counterparty),
    RepoType: new FormControl(this.RepoType),
    Side: new FormControl(this.Side),
    AvailableCashSettlementAmount: new FormControl(this.AvailableCashSettlementAmount),
    CashSettlementCurrency: new FormControl(this.CashSettlementCurrency),
    RateSpreadOverBenchmark: new FormControl(this.RateSpreadOverBenchmark),
    Floating: new FormControl(this.Floating),
    PurchasingDate: new FormControl(this.PurchasingDate),
    RepurchaseDate: new FormControl(this.RepurchaseDate),
    RepoTermType: new FormControl(this.RepoTermType),
    MarketSector: new FormControl(this.MarketSector),
    IssuerDomicile: new FormControl(this.IssuerDomicile),
    Quality: new FormControl(this.Quality),
    Collaterals: new FormControl(this.Collaterals)
  })
  columnDef: ColumnDefinition[] = [
    {
      header: 'Good To Trade',
      field: 'Good To Trade',
      selected: true,
      type: 'Select'
    },
    {
      header: 'Counterparty',
      field: 'Counterparty',
      selected: true,
      type: 'Select'
    },
    {
      header: 'Repo Type',
      field: 'Repo Type',
      selected: true,
      type: 'Select'
    },
    {
      header: 'Side',
      field: 'Side',
      selected: true,
      type: 'Select'
    },
    {
      header: 'Available Cash Settlement Amount',
      field: 'Available Cash Settlement Amount',
      selected: true,
      type: 'Range',
      symbol: 'Mio'
    },
    {
      header: 'Cash Settlement Currency',
      field: 'Cash Settlement Currency',
      selected: true,
      type: 'Select'
    },
    {
      header: 'Rate/Spread Over Benchmark',
      field: 'Rate/Spread Over Benchmark',
      selected: true,
      type: 'Range',
      symbol: '%'
    },
    {
      header: 'Floating',
      field: 'Floating',
      selected: true,
      type: 'Select'
    },
    {
      header: 'Purchasing Date',
      field: 'Purchasing Date',
      selected: true,
      type: 'Date'
    },
    {
      header: 'Repurchase Date',
      field: 'Repurchase Date',
      selected: true,
      type: 'Date'
    },
    {
      header: 'Repo Term Type',
      field: 'Repo Term Type',
      selected: true,
      type: 'Select'
    },
    {
      header: 'Market Sector',
      field: 'Market Sector',
      selected: true,
      type: 'Search'
    },
    {
      header: 'Issuer Domicile',
      field: 'Issuer Domicile',
      selected: true,
      type: 'Search'
    },
    {
      header: 'Quality',
      field: 'Quality',
      selected: true,
      type: 'Search'
    },
    {
      header: 'Collaterals',
      field: 'Collaterals',
      selected: true,
      type: 'Search'
    }
  ];
  pipe: DatePipe = new DatePipe('en-US');
  gridApi: any;

  constructor(private _decimalPipe: DecimalPipe) { }

  async ngOnInit() {
    this.getAllData();
  }

  onGridReady(event: any): void {
    this.gridApi = event;
  }


  // Creates new user.
  createNewUser(id: number, newDataFormValue: any): UserData {
    return {
      'Good To Trade': newDataFormValue['GoodToTrade'],
      'Counterparty': newDataFormValue['Counterparty'],
      'Repo Type': newDataFormValue['RepoType'],
      'Side': newDataFormValue['Side'],
      'Available Cash Settlement Amount': newDataFormValue['AvailableCashSettlementAmount'],
      'Cash Settlement Currency': newDataFormValue['CashSettlementCurrency'],
      'Rate/Spread Over Benchmark': newDataFormValue['RateSpreadOverBenchmark'],
      'Floating': newDataFormValue['Floating'],
      'Purchasing Date': newDataFormValue['PurchasingDate'],
      'Repurchase Date': newDataFormValue['RepurchaseDate'],
      'Repo Term Type': newDataFormValue['RepoTermType'],
      'Market Sector': newDataFormValue['MarketSector'],
      'Issuer Domicile': newDataFormValue['IssuerDomicile'],
      'Quality': newDataFormValue['Quality'],
      'Collaterals': newDataFormValue['Collaterals'],
      'id': id.toString()
    };
  }

  // Adds new user
  addRow(newDataFormValue: any) {
    this.dataSource.push(this.createNewUser(this.dataSource.length + 1, newDataFormValue));
    // this.gridApi.resetFilters();
    this.gridApi.prepareTableData();
  }

  // addRow() {
  //   let gridData = {
  //     'Good To Trade': '',
  //     'Counterparty': '',
  //     'Repo Type': '',
  //     'Side': '',
  //     'Available Cash Settlement Amount': '',
  //     'Cash Settlement Currency': '',
  //     'Rate/Spread Over Benchmark': '',
  //     'Floating': '',
  //     'Purchasing Date': '',
  //     'Repurchase Date': '',
  //     'Repo Term Type': '',
  //     'Market Sector': '',
  //     'Issuer Domicile': '',
  //     'Quality': '',
  //     'Collaterals': '',
  //     'hideAction': true,
  //     'hideEditAction': true,
  //     'canInitiate': true,
  //     'id': ''
  //   };
  //   this.dataSource.push(gridData);

  //   this.gridApi.prepareTableData();
  // }

  getAllData(): void {
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
        'Purchasing Date': this.pipe.transform(new Date(data.purchaseDateStamp), 'yyyy/MM/dd') || '-',
        'Repurchase Date': this.pipe.transform(new Date(data.repurchaseDateStamp), 'yyyy/MM/dd') || '-',
        'Repo Term Type': data.requestType === 'STANDARD' ? data.requestType + ' - ' + data.term : data.requestType?.replace('_', ' '),
        'Market Sector': data.marketSector?.length ? data.marketSector.join(', ') : '-',
        'Issuer Domicile': data.issuerDomicile?.length ? data.issuerDomicile.join(', ') : '-',
        'Quality': data.quality?.length ? data.quality.join(', ') : '-',
        'Collaterals': data.offerBidType === 'B' ? data.collateral?.length ? data.collateral.map(collateral => collateral.isin).join(',') : '-' : data.selectedCollaterals?.length ? data.selectedCollaterals.map((selectedCollaterals: any) => selectedCollaterals.isin).join(',') : '-',
        'hideAction': true,
        'hideEditAction': true,
        'canInitiate': true,
        'id': data._id
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
    "requestType": "EVERGREEN",
    "purchaseDate": "29.04.2022",
    "currency": "USD",
    "amount": 30.5,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 97.78,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
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
    "requestType": "EVERGREEN",
    "purchaseDate": "29.04.2022",
    "currency": "USD",
    "amount": 121.44,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "SPECIFIC",
    "crossCcy": false,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 56,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "6204c36fa90ddc07b09bdeba",
    "requestCreatorCompany": "6204c36fa90ddc07b09bdeb2",
    "purchaseDateStamp": "2022-01-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-04-02T00:00:00.000Z",
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
    "rate": 1.00,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-04-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-07-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:09:18.336Z",
    "updatedAt": "2022-04-28T06:09:18.336Z",
    "__v": 0,
    "requestCreatorCompanyName": "Blue Bank"
  },
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
    "amount": 231,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 97.78,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:56:25.705Z",
    "updatedAt": "2022-04-28T06:56:25.705Z",
    "__v": 0,
    "requestCreatorCompanyName": "Blue Bank"
  },  {
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
    "amount": 452,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 97.78,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:56:25.705Z",
    "updatedAt": "2022-04-28T06:56:25.705Z",
    "__v": 0,
    "requestCreatorCompanyName": "Blue Bank"
  },  {
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
    "amount": 67,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 63,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:56:25.705Z",
    "updatedAt": "2022-04-28T06:56:25.705Z",
    "__v": 0,
    "requestCreatorCompanyName": "Blue Bank"
  },  {
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
    "amount": 45,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 56,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:56:25.705Z",
    "updatedAt": "2022-04-28T06:56:25.705Z",
    "__v": 0,
    "requestCreatorCompanyName": "Blue Bank"
  },  {
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
    "requestType": "EXTENDABLE",
    "purchaseDate": "29.04.2022",
    "currency": "USD",
    "amount": 89,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 78,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:56:25.705Z",
    "updatedAt": "2022-04-28T06:56:25.705Z",
    "__v": 0,
    "requestCreatorCompanyName": "Blue Bank"
  },  {
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
    "requestType": "BROKEN DATE",
    "purchaseDate": "29.04.2022",
    "currency": "USD",
    "amount": 899,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 8,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:56:25.705Z",
    "updatedAt": "2022-04-28T06:56:25.705Z",
    "__v": 0,
    "requestCreatorCompanyName": "Blue Bank"
  },  {
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
    "requestType": "BROKEN DATE",
    "purchaseDate": "29.04.2022",
    "currency": "USD",
    "amount": 555,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 48,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:56:25.705Z",
    "updatedAt": "2022-04-28T06:56:25.705Z",
    "__v": 0,
    "requestCreatorCompanyName": "Blue Bank"
  },  {
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
    "requestType": "BROKEN DATE",
    "purchaseDate": "29.04.2022",
    "currency": "USD",
    "amount": 30.5,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 18,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:56:25.705Z",
    "updatedAt": "2022-04-28T06:56:25.705Z",
    "__v": 0,
    "requestCreatorCompanyName": "Blue Bank"
  },  {
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
    "requestType": "BROKEN DATE",
    "purchaseDate": "29.04.2022",
    "currency": "USD",
    "amount": 30.5,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 60,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:56:25.705Z",
    "updatedAt": "2022-04-28T06:56:25.705Z",
    "__v": 0,
    "requestCreatorCompanyName": "Blue Bank"
  },  {
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
    "requestType": "BROKEN DATE",
    "purchaseDate": "29.04.2022",
    "currency": "USD",
    "amount": 30.5,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 29,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:56:25.705Z",
    "updatedAt": "2022-04-28T06:56:25.705Z",
    "__v": 0,
    "requestCreatorCompanyName": "Blue Bank"
  },  {
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
    "requestType": "OPEN",
    "purchaseDate": "29.04.2022",
    "currency": "USD",
    "amount": 30.5,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 34,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:56:25.705Z",
    "updatedAt": "2022-04-28T06:56:25.705Z",
    "__v": 0,
    "requestCreatorCompanyName": "Blue Bank"
  },  {
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
    "requestType": "OPEN",
    "purchaseDate": "29.04.2022",
    "currency": "USD",
    "amount": 30.5,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 88,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:56:25.705Z",
    "updatedAt": "2022-04-28T06:56:25.705Z",
    "__v": 0,
    "requestCreatorCompanyName": "Blue Bank"
  },  {
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
    "requestType": "OPEN",
    "purchaseDate": "29.04.2022",
    "currency": "USD",
    "amount": 30.5,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 10,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:56:25.705Z",
    "updatedAt": "2022-04-28T06:56:25.705Z",
    "__v": 0,
    "requestCreatorCompanyName": "Blue Bank"
  },  {
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
    "requestType": "OPEN",
    "purchaseDate": "29.04.2022",
    "currency": "USD",
    "amount": 30.5,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 97.78,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:56:25.705Z",
    "updatedAt": "2022-04-28T06:56:25.705Z",
    "__v": 0,
    "requestCreatorCompanyName": "Blue Bank"
  },  {
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
    "requestType": "EXTENDABLE",
    "purchaseDate": "29.04.2022",
    "currency": "USD",
    "amount": 30,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 25,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-05-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:56:25.705Z",
    "updatedAt": "2022-04-28T06:56:25.705Z",
    "__v": 0,
    "requestCreatorCompanyName": "Blue Bank"
  },  {
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
    "requestType": "EXTENDABLE",
    "purchaseDate": "29.04.2022",
    "currency": "USD",
    "amount": 333,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "BROAD",
    "crossCcy": true,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 0.78,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "62171b64a97f75076b9106e9",
    "requestCreatorCompany": "62171b64a97f75076b9106dd",
    "purchaseDateStamp": "2022-03-29T00:00:00.000Z",
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
        "isin": "BE6271706566",
        "currency": "USD",
        "couponInPercentage": "2.875",
        "maturityDate": "2024-09-18",
        "issuerDomicile": "Belgium",
        "_id": "626a126f9e5f001db78f5f27"
      },
      {
        "id": 1,
        "itemName": "BE6322164920, Belgium, 1%, 2030-05-28",
        "isin": "BE632216567",
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
    "requestType": "EXTENDABLE",
    "purchaseDate": "29.04.2022",
    "currency": "USD",
    "amount": 121.44,
    "frequencyOfReset": null,
    "frequencyOfResetUnit": "M",
    "collateralType": "SPECIFIC",
    "crossCcy": false,
    "ros": true,
    "requestTimeout": 15,
    "repurchaseDate": "02.05.2022",
    "term": "T/N",
    "callableType": "T1",
    "rate": 56,
    "haircut": 0,
    "counterRates": [],
    "callable": true,
    "requestCreatorUser": "6204c36fa90ddc07b09bdeba",
    "requestCreatorCompany": "6204c36fa90ddc07b09bdeb2",
    "purchaseDateStamp": "2022-01-29T00:00:00.000Z",
    "repurchaseDateStamp": "2022-04-02T00:00:00.000Z",
    "createdAt": "2022-04-28T06:42:14.234Z",
    "updatedAt": "2022-04-28T06:42:14.234Z",
    "__v": 0,
    "goodToTrade": true,
    "requestCreatorCompanyName": "CCL"
  }

]

export interface UserData {
  'Good To Trade': string;
  'Counterparty': string;
  'Repo Type': string;
  'Side': string;
  'Available Cash Settlement Amount': string;
  'Cash Settlement Currency': string;
  'Rate/Spread Over Benchmark': string;
  'Floating': string;
  'Purchasing Date': string;
  'Repurchase Date': string;
  'Repo Term Type': string;
  'Market Sector': string;
  'Issuer Domicile': string;
  'Quality': string;
  'Collaterals': string;
  'id': string;
}


