import { Injectable } from '@angular/core';
import { BINARY_BODY, Environment, Route, Transaction } from '@mockoon/commons';
import { EnvironmentSchema } from 'src/renderer/app/constants/environment-schema.constants';
import { EnvironmentLog } from 'src/renderer/app/models/environment-logs.model';
import { MigrationService } from 'src/renderer/app/services/migration.service';
import { Store } from 'src/renderer/app/stores/store';
import { v4 as uuid } from 'uuid';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(
    private store: Store,
    private migrationService: MigrationService
  ) {}

  /**
   * Migrate an environment and validate it against the schema
   *
   * @param environment
   * @returns
   */
  public migrateAndValidateEnvironment(environment: Environment): Environment {
    return EnvironmentSchema.validate(
      this.migrationService.migrateEnvironment(environment)
    ).value;
  }

  /**
   * Format request/response to EnvironmentLog to be consumed by the UI
   *
   * @param response
   */
  public formatLog(transaction: Transaction): EnvironmentLog {
    return {
      UUID: uuid(),
      routeUUID: transaction.routeUUID,
      routeResponseUUID: transaction.routeResponseUUID,
      timestamp: new Date(),
      method: transaction.request.method,
      route: transaction.request.route,
      url: transaction.request.urlPath,
      request: {
        params: transaction.request.params,
        queryParams: transaction.request.queryParams,
        body: transaction.request.body,
        headers: transaction.request.headers
      },
      proxied: transaction.proxied,
      response: {
        status: transaction.response.statusCode,
        headers: transaction.response.headers,
        body: transaction.response.body,
        binaryBody: transaction.response.body === BINARY_BODY
      }
    };
  }

  /**
   * Generate a unused port to a new environment
   */
  public getNewEnvironmentPort(): number {
    const usedPorts = this.store.getEnvironmentsPorts();
    const activeEnvironment: Environment = this.store.getActiveEnvironment();
    const min = Math.ceil(1024);
    const max = Math.floor(65535);
    let testSelectedPort: number;

    if (activeEnvironment == null) {
      testSelectedPort = 3000;
    } else {
      testSelectedPort = activeEnvironment.port + 1;
    }

    for (let i = 0; i < 10; i++) {
      if (testSelectedPort >= 65535) {
        break;
      } else if (!usedPorts.includes(testSelectedPort)) {
        return testSelectedPort;
      }
      testSelectedPort++;
    }

    do {
      testSelectedPort = Math.floor(Math.random() * (max - min)) + min;
    } while (usedPorts.includes(testSelectedPort));

    return testSelectedPort;
  }

  /**
   * Renew one environment UUIDs
   *
   * @param params
   */
  public renewEnvironmentUUIDs(environment: Environment) {
    environment.uuid = uuid();

    environment.routes.forEach((route) => {
      this.renewRouteUUIDs(route);
    });

    return environment;
  }

  /**
   * Renew one route UUIDs
   *
   * @param params
   */
  public renewRouteUUIDs(route: Route) {
    route.uuid = uuid();

    route.responses.forEach((routeResponse) => {
      routeResponse.uuid = uuid();
    });

    return route;
  }

  /**
   * Truncate the body to the maximum length defined in the settings
   *
   * @param body
   */
  public truncateBody(body: string) {
    const logSizeLimit = this.store.get('settings').logSizeLimit;

    if (body.length > logSizeLimit) {
      body =
        body.substring(0, logSizeLimit) +
        '\n\n-------- BODY HAS BEEN TRUNCATED --------';
    }

    return body;
  }
}
