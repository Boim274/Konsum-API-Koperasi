$(document).ready(function () {
    // Periksa token
    var token = localStorage.getItem('token');
    if (!token) {
        // Jika token tidak ditemukan, arahkan ke halaman login
        window.location.href = '../login/login.html';
        return;
    }
 
    var dataUrl = 'http://127.0.0.1:8000/api/admin/produks';
    var imgurl = 'http://127.0.0.1:8000/storage/';
    var kategoriUrl = 'http://127.0.0.1:8000/api/admin/kategoris'; // URL untuk kategor
 
    function handleError(jqXHR, textStatus, errorThrown) {
        console.error('Error: ' + textStatus, errorThrown);
        $('#dataResult').text('Error: ' + textStatus + ' ' + errorThrown);
    }
 
    // Periksa peran pengguna
    $.ajax({
        url: 'http://127.0.0.1:8000/api/user',
        type: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        dataType: 'json',
        success: function (response) {
            if (response.role === 'admin') { // Ubah cara mengakses peran pengguna
                // Pengguna adalah admin, lanjutkan dengan mendapatkan data makanan
                $.ajax({
                    url: dataUrl,
                    type: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    dataType: 'json',
                    success: function (data) {
                        if (data.success && Array.isArray(data.data.products)) {
                            createTable(data.data.products);
                        } else {
                            $('#dataResult').text('Data fetched is not valid.');
                        }
                    },
                    error: handleError
                });
                loadKategori(); // Panggil loadKategori setelah mendapatkan data pengguna
            } else {
                // Jika bukan admin, arahkan ke halaman pembeli
                window.location.href = '../pembeli/index.html';
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error: ' + textStatus, errorThrown);
            // Jika terjadi kesalahan (misalnya token tidak valid), arahkan ke halaman login
            window.location.href = '../login/login.html';
        }
    });
 
    // Fungsi untuk membuat tabel
    function createTable(data) {
        var tableBody = $('#product-table');
        tableBody.empty();

        data.forEach(function (product, index) {
            var row = $('<tr></tr>');
            row.append('<td>' + (index + 1) + '</td>'); // ID Produk
            row.append('<td>' + product.product_name + '</td>'); // Nama Produk
            row.append('<td>' + (product.description || '-') + '</td>'); // Deskripsi
            row.append('<td>' + product.harga + '</td>'); // Harga
            row.append('<td>' + (product.stok !== null ? product.stok : '-') + '</td>'); // Stok
            row.append('<td>' + product.kategori_id + '</td>'); // ID Kategori

            // Menyusun URL gambar dengan benar
            var imageUrl = imgurl + product.image;
            row.append('<td><img src="' + imageUrl + '" alt="Image" style="max-width: 100px; max-height: 100px;"></td>');

            // Tambahkan tombol Update dan Delete
            var actionButtons = $('<td></td>');
            var updateButton = $('<button class="btn btn-primary update-btn">Update</button>').attr('data-id', product.id);
            var deleteButton = $('<button class="btn btn-danger delete-btn">Delete</button>').attr('data-id', product.id);
            actionButtons.append(updateButton).append(' ').append(deleteButton);
            row.append(actionButtons);

            tableBody.append(row);
        });

        // Tambahkan event listener untuk tombol Update
        $('.update-btn').on('click', function () {
            var id = $(this).data('id');
            window.location.href = 'update.html?id=' + id;
        });

        // Tambahkan event listener untuk tombol Delete
        $('.delete-btn').on('click', function () {
            var id = $(this).data('id');
            deleteProduct(id);
        });

        function deleteProduct(id) {
            // Konfirmasi pengguna sebelum menghapus
            if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
                $.ajax({
                    url: 'http://127.0.0.1:8000/api/admin/produks/' + id,
                    type: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    success: function (response) {
                        // Hapus baris dari tabel setelah berhasil menghapus dari server
                        $('tr[data-id="' + id + '"]').remove(); // Hapus baris yang terkait dari tabel
                        $('#dataResult').text('Produk berhasil dihapus.');

                        // Refresh halaman setelah menghapus
                        location.reload();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.error('Error: ' + textStatus, errorThrown);
                        $('#dataResult').text('Gagal menghapus produk: ' + textStatus);
                    }
                });
            }
        }
    }
 
    function loadKategori() {
        $.ajax({
            url: kategoriUrl,
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            dataType: 'json',
            success: function (data) {
                console.log('Kategori fetched:', data); // Logging tambahan
                var kategoriSelect = $('#kategori');
                if (data.success && Array.isArray(data.data.categories)) {
                    data.data.categories.forEach(function (category) {
                        kategoriSelect.append(new Option(category.name, category.id));
                    });
                } else {
                    console.error('Unexpected response format:', data);
                }
            },
            error: handleError
        });
    }
 
    // Fungsi untuk menangani pengiriman form
    $('#productForm').on('submit', function (e) {
        e.preventDefault();

        var formData = new FormData();
        formData.append('product_name', $('#product_name').val());
        formData.append('image', $('#image')[0].files[0]);
        formData.append('description', $('#description').val());
        formData.append('harga', $('#harga').val());
        formData.append('stok', $('#stok').val());
        formData.append('kategori_id', $('#kategori_id').val());

        $.ajax({
            url: dataUrl,
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                $('#dataResult').text('Produk berhasil ditambahkan.');
                location.reload();
                // setTimeout(function () {
                //     window.location.href = 'index.html';
                // }, 2000); // Tunggu 2 detik sebelum mengarahkan ke index.html
            },
            error: handleError
        });
    });
});
 