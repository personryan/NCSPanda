import { Controller, Get, Headers, Inject, Query, UnauthorizedException } from '@nestjs/common';
import { VendorReportQueryDto } from './dto/vendor-report-query.dto';
import { ReportingService } from './reporting.service';

@Controller('reports')
export class ReportingController {
  constructor(@Inject(ReportingService) private readonly reportingService: ReportingService) {}

  @Get('vendor-summary')
  getVendorSummary(@Query() query: VendorReportQueryDto, @Headers('x-user-role') role?: string) {
    if (role !== 'vendor' && role !== 'admin') {
      throw new UnauthorizedException('Vendor or admin role is required');
    }

    return this.reportingService.getVendorAnalytics(query);
  }
}
