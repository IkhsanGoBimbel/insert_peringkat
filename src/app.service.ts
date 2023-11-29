import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class AppService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  getHello(): string {
    return 'Hello World!';
  }

  async readFiles(file: any) {
    const workbook = new ExcelJS.Workbook();
    try {
      if (!file) {
        throw new Error('Tidak ada file');
      }
      const filePath = path.join(__dirname, '..', 'excel', file.filename);

      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1); // Assuming you want to read the first worksheet.

      const data = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          // Header row, you can process the headers here.
        } else {
          // Data rows
          const rowData = {};
          row.eachCell((cell, colNumber) => {
            // Map column headers to keys
            const columnHeader: any = worksheet
              .getRow(1)
              .getCell(colNumber).value;
            rowData[columnHeader] = cell.value;
          });
          data.push(rowData);
        }
      });

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Menghapus file jika ada
        console.log('File berhasil dihapus.');
      } else {
        console.log('File tidak ditemukan, tidak ada yang dihapus.');
      }
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }

  async readFilesAndFindBundling(file: any) {
    const workbook = new ExcelJS.Workbook();
    try {
      if (!file) {
        throw new Error('Tidak ada file');
      }
      const filePath = path.join(__dirname, '..', 'excel', file.filename);

      if (!fs.existsSync(filePath)) {
        throw new Error('File not found');
      }
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.getWorksheet(1); // Assuming you want to read the first worksheet.

      const data = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          // Header row, you can process the headers here.
        } else {
          // Data rows
          const rowData = {};
          row.eachCell((cell, colNumber) => {
            // Map column headers to keys
            const columnHeader: any = worksheet
              .getRow(1)
              .getCell(colNumber).value;
            rowData[columnHeader] = cell.value;
          });
          data.push(rowData);
        }
      });

      let data_fix: any[] = [];
      let data_no_bundling: any[] = [];

      const findData = async (index, item: any) => {
        return new Promise<void>((resolve) => {
          setTimeout(async () => {
            const dobel = await this.prisma.t_produk_siswa.findMany({
              where: {
                c_no_register: +item.c_no_register,
                c_tahun_ajaran: '2023/2024',
              },
            });

            const cari = await this.prisma.t_produk_siswa.findFirst({
              where: {
                c_no_register: +item.c_no_register,
                c_tahun_ajaran: '2023/2024',
              },
            });
            console.log(index + 1);

            if (cari && dobel.length >= 1) {
              // Add a new column c_id_bundling to the item
              let newItem;

              if (dobel.length == 1) {
                newItem = {
                  ...item,
                  c_id_bundling: cari.c_id_bundling,
                };
                data_fix.push(newItem);
              } else {
                dobel.map((siswa) => {
                  newItem = {
                    c_no_register: item.c_no_register,
                    c_nama_lengkap: item.c_nama_lengkap,
                    c_total: item.c_total,
                    c_id_sekolah_kelas: siswa.c_id_sekolah_kelas,
                    c_id_kota: item.c_id_kota,
                    c_nama_kota: item.c_nama_kota,
                    c_id_gedung: item.c_id_gedung,
                    c_nama_gedung: item.c_nama_gedung,
                    c_tahun_ajaran: item.c_tahun_ajaran,
                    c_benarlevel1: item.c_benarlevel1,
                    c_benarlevel2: item.c_benarlevel2,
                    c_benarlevel3: item.c_benarlevel3,
                    c_benarlevel4: item.c_benarlevel4,
                    c_benarlevel5: item.c_benarlevel5,
                    c_salahlevel1: item.c_salahlevel1,
                    c_salahlevel2: item.c_salahlevel2,
                    c_salahlevel3: item.c_salahlevel3,
                    c_salahlevel4: item.c_salahlevel4,
                    c_salahlevel5: item.c_salahlevel5,
                    c_id_bundling: siswa.c_id_bundling,
                  };
                  data_fix.push(newItem);
                });
              }
            } else if (!cari && dobel.length == 0) {
              // Add a new column c_id_bundling with null value to the item
              const OldItem = {
                ...item,
                c_id_bundling: null,
              };
              // Push the item with null c_id_bundling to data_no_bundling
              data_no_bundling.push(OldItem);
              console.log('tidak ada bundling');
            }

            resolve();
          }, 1); // Set the delay in milliseconds (1 detik)
        });
      };

      // Process each data item with a delay
      for (const [index, item] of data.entries()) {
        await findData(index, item);
      }

      const workbookBaru = new ExcelJS.Workbook();
      const worksheetBaru = workbookBaru.addWorksheet('Data_fix');

      // Menentukan header kolom
      worksheetBaru.columns = [
        { header: 'c_no_register', key: 'c_no_register' },
        { header: 'c_nama_lengkap', key: 'c_nama_lengkap' },
        { header: 'c_total', key: 'c_total' },
        { header: 'c_id_sekolah_kelas', key: 'c_id_sekolah_kelas' },
        { header: 'c_id_kota', key: 'c_id_kota' },
        { header: 'c_nama_kota', key: 'c_nama_kota' },
        { header: 'c_id_gedung', key: 'c_id_gedung' },
        { header: 'c_nama_gedung', key: 'c_nama_gedung' },
        { header: 'c_tahun_ajaran', key: 'c_tahun_ajaran' },
        { header: 'c_benarlevel1', key: 'c_benarlevel1' },
        { header: 'c_benarlevel2', key: 'c_benarlevel2' },
        { header: 'c_benarlevel3', key: 'c_benarlevel3' },
        { header: 'c_benarlevel4', key: 'c_benarlevel4' },
        { header: 'c_benarlevel5', key: 'c_benarlevel5' },
        { header: 'c_salahlevel1', key: 'c_salahlevel1' },
        { header: 'c_salahlevel2', key: 'c_salahlevel2' },
        { header: 'c_salahlevel3', key: 'c_salahlevel3' },
        { header: 'c_salahlevel4', key: 'c_salahlevel4' },
        { header: 'c_salahlevel5', key: 'c_salahlevel5' },
        { header: 'c_id_bundling', key: 'c_id_bundling' },
      ];

      // console.log(worksheet_baru)

      data_fix.forEach((items) => {
        worksheetBaru.addRow({
          c_no_register: items.c_no_register,
          c_nama_lengkap: items.c_nama_lengkap,
          c_total: items.c_total,
          c_id_sekolah_kelas: items.c_id_sekolah_kelas,
          c_id_kota: items.c_id_kota,
          c_nama_kota: items.c_nama_kota,
          c_id_gedung: items.c_id_gedung,
          c_nama_gedung: items.c_nama_gedung,
          c_tahun_ajaran: items.c_tahun_ajaran,
          c_benarlevel1: items.c_benarlevel1,
          c_benarlevel2: items.c_benarlevel2,
          c_benarlevel3: items.c_benarlevel3,
          c_benarlevel4: items.c_benarlevel4,
          c_benarlevel5: items.c_benarlevel5,
          c_salahlevel1: items.c_salahlevel1,
          c_salahlevel2: items.c_salahlevel2,
          c_salahlevel3: items.c_salahlevel3,
          c_salahlevel4: items.c_salahlevel4,
          c_salahlevel5: items.c_salahlevel5,
          c_id_bundling: items.c_id_bundling,
        });
      });

      const filePathBaru = `${file.filename} data_fix_bundling.xlsx`;
      await workbookBaru.xlsx.writeFile(filePathBaru);

      const workbookBaruNoBundling = new ExcelJS.Workbook();
      const worksheetBaruBaruNoBundling =
        workbookBaruNoBundling.addWorksheet('Data_no_bundling');

      // Menentukan header kolom
      worksheetBaruBaruNoBundling.columns = [
        { header: 'c_no_register', key: 'c_no_register' },
        { header: 'c_nama_lengkap', key: 'c_nama_lengkap' },
        { header: 'c_total', key: 'c_total' },
        { header: 'c_id_sekolah_kelas', key: 'c_id_sekolah_kelas' },
        { header: 'c_id_kota', key: 'c_id_kota' },
        { header: 'c_nama_kota', key: 'c_nama_kota' },
        { header: 'c_id_gedung', key: 'c_id_gedung' },
        { header: 'c_nama_gedung', key: 'c_nama_gedung' },
        { header: 'c_tahun_ajaran', key: 'c_tahun_ajaran' },
        { header: 'c_benarlevel1', key: 'c_benarlevel1' },
        { header: 'c_benarlevel2', key: 'c_benarlevel2' },
        { header: 'c_benarlevel3', key: 'c_benarlevel3' },
        { header: 'c_benarlevel4', key: 'c_benarlevel4' },
        { header: 'c_benarlevel5', key: 'c_benarlevel5' },
        { header: 'c_salahlevel1', key: 'c_salahlevel1' },
        { header: 'c_salahlevel2', key: 'c_salahlevel2' },
        { header: 'c_salahlevel3', key: 'c_salahlevel3' },
        { header: 'c_salahlevel4', key: 'c_salahlevel4' },
        { header: 'c_salahlevel5', key: 'c_salahlevel5' },
        { header: 'c_id_bundling', key: 'c_id_bundling' },
      ];

      data_no_bundling.forEach((items) => {
        worksheetBaruBaruNoBundling.addRow({
          c_no_register: items.c_no_register,
          c_nama_lengkap: items.c_nama_lengkap,
          c_total: items.c_total,
          c_id_sekolah_kelas: items.c_id_sekolah_kelas,
          c_id_kota: items.c_id_kota,
          c_nama_kota: items.c_nama_kota,
          c_id_gedung: items.c_id_gedung,
          c_nama_gedung: items.c_nama_gedung,
          c_tahun_ajaran: items.c_tahun_ajaran,
          c_benarlevel1: items.c_benarlevel1,
          c_benarlevel2: items.c_benarlevel2,
          c_benarlevel3: items.c_benarlevel3,
          c_benarlevel4: items.c_benarlevel4,
          c_benarlevel5: items.c_benarlevel5,
          c_salahlevel1: items.c_salahlevel1,
          c_salahlevel2: items.c_salahlevel2,
          c_salahlevel3: items.c_salahlevel3,
          c_salahlevel4: items.c_salahlevel4,
          c_salahlevel5: items.c_salahlevel5,
          c_id_bundling: items.c_id_bundling,
        });
      });

      const filePathBaruNoBundling = `${file.filename} data_no_bundling.xlsx`;
      await workbookBaruNoBundling.xlsx.writeFile(filePathBaruNoBundling);

      console.log(`data fix bundling = ${data_fix.length}`);
      console.log(`data no bundling = ${data_no_bundling.length}`);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Menghapus file jika ada
        console.log('File berhasil dihapus.');
      } else {
        console.log('File tidak ditemukan, tidak ada yang dihapus.');
      }
      return data_fix;
    } catch (error) {
      throw new Error(error);
    }
  }
}
