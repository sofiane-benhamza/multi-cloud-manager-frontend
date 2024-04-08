import { useRouter } from "next/router";
import { Card, CardHeader, CardBody, Image } from "@nextui-org/react";
import { useEffect } from "react";
import ProfileNavbar from '../../../comps/ProfileNavbar.js'; // Importing the profile component

export default function profile() {
    const router = useRouter();

    return (
        <>  <ProfileNavbar />
            <div className="d-flex row w-100 justify-content-center text-light" style={{ minHeight: "calc( 100vh - 200px )" }}>
                <Card className="py-4 mb-5 border mx-5 col-lg-3 col-md-4 col-sm-11 col-xs-11 cloud_provider_card"
                    style={{ border: "2px solid white", width: "306px", borderRadius: "10px", maxHeight: "400px" }}>
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                        <p className="text-tiny uppercase font-bold">Amazon Web Services</p>
                        <small className="text-default-500">12 Managed Services</small>
                        <h4 className="font-bold text-large">Leader of Cloud Providers</h4>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2 d-flex justify-content-center">
                        <Image
                            alt="Card background"
                            className="object-cover rounded-xl bg-light p-3 rounded"
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1024px-Amazon_Web_Services_Logo.svg.png"
                            width={270}
                        />
                    </CardBody>
                </Card>
                <Card className="py-4 mb-5 border mx-5 col-lg-3 col-md-4 col-sm-11 col-xs-11 cloud_provider_card"
                    style={{ border: "2px solid white", width: "306px", borderRadius: "10px", maxHeight: "400px" }}>
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                        <p className="text-tiny uppercase font-bold">Google Cloud Platform</p>
                        <small className="text-default-500">5 Managed Services</small>
                        <h4 className="font-bold text-large">Creator of Microsoft Windows</h4>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2 d-flex justify-content-center">
                        <Image
                            alt="Card background"
                            className="object-cover rounded-xl bg-light p-3 rounded"
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACoCAMAAABt9SM9AAABMlBMVEX///9ChfT7vAXqQzU0qFNPVFo+g/RXXGH7uAA+rFsvp1BbtXFlmPZUWV5RVlxLivTX2Nnq6uvy8vMzqkNDgvuChYiur7LP0NFdYWYsif8re/NLUFb8vwB7foKdn6LpOSnpMyBwdHiMj5LFxsfqPzDpLxspevMbp1ZkaGyjpaj97OvpOCj0PRboKhT9353+7sz+9eC4ubvh4uL61tT1sa30qKT3wL3ympT4ycbwhn+Wt/j74uDwbynyfyX0jh/7wST95rPb5v3N3fzr8f6ErPe+0vv8yEmKrz7tZlzubmXvenLsXFGgWJnwgXqkZqDrTkLxkIrsWDBZkvX4qhH92o+gvvnvZwD7x1b//ffH2Pv803T946r+9uN3o/b925P8zmKZ0Kvd7+KExpOxyfqx2rqSy5/5u8o9AAAIpElEQVR4nO2cDXubthaA7XYyXhsUoDNmZmDAToqbJQ00zceyfmZL13X3tt1tbz+2dMuy/f+/MAmMYyxhy01rgnze59la2QGLN0dHh0PSWg0AAAAAAAAAAAAAAAAAAAAAqsutO7s7dwk7u3dulT2XS83+3k/dNc/bSPC8te5Pe/tG2ZO6lOw+9bxu/2qOftfznu6CrzyHB543IWokzPMODsue3yXi8Olml28qpbv59E7Zc7wk3Pp5syCoxsJr82dI94S7a1OjaqRr7W7ZMy2dW888EVUU79mSB9d+UVrnB9d+2fMtk7ub4qoom3tlz7g8XqzN5+rqt7/8UPacy+I/wukqc/XfrzsnZc+6HA4+wlW93lnK2Nqbew1SV8TWd2XPfPHszpnbM1f1+vqPZc990Rx+tCti61HZs18wz4vqq353w1sjeBu5FsSYq3pjtezZL5a9Db6q7trzg539Q8L+zsHz8xuhcVfE1lKlrYJF6PX3cs2Yw72+x3G1ZAvxGW8Rdvs77Ffu9DdYV/XGr4ufc1ns86qGzRf8L36xybgi9cPy7Iic7N73Cm+S91lX9frS5HhOYPWvTmm/HK02GFlLE1qjjPXy+3v3Cfe+f/l8+hGsrWXJWulW+PL+/74Z43hre8ohBie0lmND3CPV070mEXRlnGbzwdbbwmMerTOhtRy1Vv/q/QlRI1+vCg963ZmU1VjglEvjzv+vcFUluq48LDpsdRnX4ds3haoSXW8K1uI7JrTkbwNuTzOVUpDpmR2xUZc8tm43Z8tqPuQe+uNkaJGV+Hixs18sIq4KbTEbIrmhfrfY+S8SMVfE1m3e0StssVVflza2fhd0RWzx8tZrjqxG52jhl7EYRFURWVucwx+zSUverul78cDiuaod8WTVG1I+GhNNWEWuuBm+LmnX9MFFXdW4kSVla+uhaGAVuiqSJWFrix9YzQQxV7X1ToezIUoYWtyM1Tzeur29fXvruCniqnb0+GyFp0u6Qv49T9Womtp+05ztKuHohF2M0t1Ss4GV9/JbU8gV4YzdFDufa9blwK7CyRtA+hUirmq1d4wtydbhK8YV0xT90BRzxeuaytViPmZWIfs1VwRdsa2txsqnnGvpzFqElN+Fz8Z0TaVKWm8nU1bzYueblLUu0+9CMc2Z44ud72RiHUrVqNmelPX+YuebbG1J9aSHqRw+XOx8ZzLLYiKr+GmqEFJHFiPrj4ud7weZZTG7IafMmgemhJcpwTO3hvznN6I8krrOYrtZF6odJisHyX5Yi+nQFDxIFYJ5zCPZQwu2qdwUv7uZ4Kgx2QCUrLHMZvjCHwCZxVGdaZauS5XfeW0Hwe7VJGecTqlcTQf+w53mkz9P5zvLo9ernEc8kq3CGvfZ/ZOb125c+5LHjcYqjwb/6Y5chQPlAxNaT25+QbnG4cZXPCkFdF6XfW2fngJXXOaR1ZAvsLLnN0Ku5pLVOSv7yj4Hx8Ku5pElWfWeMd4une5qHlly3UOfc14+zHA1hyx5f7s82xFnuRKXJeNOmJH+8N9MV8Ky5P43Hl41RVyJypLbFS0gBFwJylqXsmgY5/TmtU8jS/rfRkn468ZMXbNlNdblavgVcnp9lq5ZshqdlWUIq5RTEl3TfE2V1eh0TpZHFeXt39d57YZR16FRQKfTWTmTtGifyunf//x1ncuXv65wOfnubLliCgAAAAAAAAAAAAAAAAAAAAAAAAAAAACABWLoMv1DHp+TnoMRRuFgLl+mqX2u+Vxi4lBVFFUl/0PRHIfZyOS/YbQjM0pFGrEucCY9nuNjy6VtW2potttRC1v2HMGCFL4sFyNK8q5mOwJnsmwRpZcBzbaygIrD3hwH8mXpFsZB1CPmMfGkoZbAmUJUFVmWhdofdSBXlqGqrTTz6WFoyCYrUpXBxx3JleWoQfZXw5AusnwLc16NTXfQLhpEJGK0kSyNvDC6Vg0pufNksuIoGp7BMHJ/9OjrlZGFrIB9sYXI5ogtrWCgusg2UlmGT19AWXC6OB9tqSzdt20bYZoZe3b6cS2byjMRsm1VcyoiS8fZKgycFJd8pxUlDJzh3pgb+HTgY8VCQ1mWovqur2SOfJzfThNZBlb9qEc2SfJJPeSmn0YT5QBhtxeF2K+cLJ/UWYpiKX7NVVT6mkYGtWwQJ4OBmgzaOJPlKkm8DJTh5m9NXHYia5jHNGzHOVmxjZMCy7FwNWSdL0M3oISWQ15KE01PVXv5AbbSsmmgDGWpCjlaH4SKnToIcb6+pLJ0e5jHTOzmZLk4/T4ZqCqyJhJ8qLg6VoflFlIG/EGMU1kGUntai9wptYbpu4XzZQiV1UPDb0eM/JwsHw3NVmUZ0tJhLCfHRAf5b3jFquLyB3omC5MqDVmD0bWaOL9dpLJSPzUdhTlZo02wKgm+ViPJ+jwpOyQZ6UhJK3oD09jJBmhs0FaHyxBZljNe9Rs2yq1DKqud1VoackayaAg62QdXpnSgtzt4eL2Go6gkzELLSoaBQq48G7jjAydL8L6V5iMzu9oBtrLWRTys4A0bpy8FZM9s4zTr0RjNwjDGVclZtPSxsB9pWs9VLZUGQQ9ZYdvQA1Uho3ZuYFuhZsStUemgJS/oLraz+HLUNPoME5NcleyGrupTWyZdu8QcDadAIbJIYqcZQLcqsxsSNIu2aDBt0aRrZIAsFWNSQTEDMxmoFpVl0yg0beX83YQAYcVp+SqmJ9Nsat/HauCGOKlDA3LzSP7eonVW28a+20KhU5muAyXyMcakiMjyTdsnO5w1KBoEPZqzQj8avTtet2sthXZokpNpYbLSSB1mIyc9e4CR7etmSANMo6V9qxaEVZJFu8pxrk2a69pNDAxSdKGCd1N05qWx0zNnkxTDHG78SljyTCqAaycpOcJqQUcZGMNX1NAJVcUqeyKVIEg6Mo60iebTEkdmVJ2HMQAAAAAAAAAAAAAAAAAAAAAgxr8db/j28WeIMwAAAABJRU5ErkJggg=="
                            width={270}
                        />
                    </CardBody>
                </Card>
                <Card className="py-4 mb-5 border mx-5 col-lg-3 col-md-4 col-sm-11 col-xs-11 cloud_provider_card"
                    style={{ border: "2px solid white", width: "306px", borderRadius: "10px", maxHeight: "400px" }}>
                    <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                        <p className="text-tiny uppercase font-bold">Microsoft Azure</p>
                        <small className="text-default-500">5 Managed Services</small>
                        <h4 className="font-bold text-large">Creator of Microsoft Windows</h4>
                    </CardHeader>
                    <CardBody className="overflow-visible py-2 d-flex justify-content-center">
                        <Image
                            alt="Card background"
                            className="object-cover rounded-xl bg-primary p-3 rounded"
                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACoCAMAAABt9SM9AAAAtFBMVEUAc8b///8Acsf///0AcccAZ8L///wAc8UAb8QAbcX9///h6vUAc8lCktIAb8b//v9jntc1idAAa8QAZsPu9vwAd8fO4vI1hMw+jtH4/P670OrX6vdmpNnn8fkAa8EAbshzoteLuuMjfcp1q93C2vCmyOZUmNFWnNqy0emCsN8jfMyXvd+/2/SgxuopidCsyedXk9W4zeqYv+aCrt4AXL+NsNrI2fIehdOJuOW/0uVopNZeotvQkuOMAAANDUlEQVR4nO2bC2PauBKFLVm2ZGMECGNwwHghkEfTNN3s7k3u5v//r3vGhmAc0iS9G9pN5+s+CDHCPh6NzoxVz2MYhmEYhmEYhmEYhmEYhmEYhmEYhmEYhmEYhmEYhmEYhmEYhmEYhmEYhmEYhmEYhmGYD4f2tPzR5/CvIUkSK/WPPot/C9qd3XFsvZLgfOWxWK9CuoXo2h99Fj85SitPaqXMWkydlFJxmn8eTaug8rwL4V866Q0+cY5/HilLz4vuOkIUnlFudTVktZ5FYxKWkzQOxaKUyoh0zInrWZCh3EPuh366tNr+LcQ6+NGn9FOiraeVNsNbX4Q9ceV0qVciFmOjvsdCYHGIhm4YKG+kPqC5xSIoPeutRRhDrJHxzDiPhVhJ8x1aYSzT70ynU3xYfsAFVeIKrXci/Dj2xcVQJfNL4eOHfuQlbw4NrKjusy+EmJXyI7oPBED0qYBWkCifIK+7Dn7w/anSnnrzYNob5KHvi8yQWXuP8/2RYBbOzwsh/F4YixU8VtnNSbhYLIK3Jy2ZRAt8NozzgbYfSyxJlkEFs5QmDnFmpXRXovrRzyP1ZrGUN5z6foqkt3A0+kdCl4mO7gUWv4qMcvIw9Wuxwuv52we0X0TsrzGrC/PBEjwux2osg36vFqtfItFMkNzph1jkE/PmIaMbfPDLCitE33jJO5zzD4Nu/UpsxBEiHaKgdrjaKrJC2Af31hHtsuNjnFOMcRN8mFmIC4FpjO6QYbDykT6xuHTwp7jaXp3CKDrmnn5TeMxnSHjr4TiFaSsb0xBVutyBXKjIWWhl8P/dkou3jdm+tDhC4ttNFJFpQzqkVoiNHLBKJsdMiRq23Z6lm3Tlh6Eolsj2Ea621oriaxrItyV5txJhflaaEwxw6nZXsxw3GeDPEmp4d3jVGN/i/XH1ISg4GAyWSkfL/v3lKZldaUfKJl8v1+v1or+cY46/2dh8L9Iz2urc3yjjxz1xG0gvcTQt6/d6sA+n8zcZUznGwlqY0pzjJqx2GT5ap2lRpI/gdTaSiV6lRTrfXbP7nKbTMX0qmXdx2I2bz6Z0hhM7qtpt5528Pt3OpTTe0Tq6iBjtrivXXodRmI5p/VqmcW8TbAJ2qfhk3mLEHUwW/JnSwxyaTx47F269jdfNBA/FtcJtyKBpY7YGHSTOSizPdnHYyXBGC00PYmEiRvqCpgB9HGNly/JotSfi3EzyOHyMLHEzx4xDqRNuUlYPWoXiKniDA5DDaejnA6uVu8ZFXj2uD+5CNEAY+x2HcXWGdTjYjT+cirgWS5JY4vcB7luc++KLQamv8dtYpFmWFXQnp/aY3qRcUUTVYYSzWFL+HOJeb2Mg9hFjuPRXDkfJ+AuuAmZNe7afIwl6StVp2Hz9bcdlCkW7CGM5yvD1jcwWTLeRtRFrJeLrfre/HiBlJRfID73bgXV2vKAi4+p4LTdZzuLdzIj91RCRbrTYxxf0/qtIjC7XPq2pNLrt4Ab8DSHqTxu7wUR0P8R9ICux8LJhT4KpvxXLdDHbpnk+CKwtnTGayvs47joS2QT023xwtJwlXSEaaSQ/twnSwqItViy6r3SmOlGfCoxYew1kr9i/CKRuZWEdXSIXXpANeFmsOO47cjkKi+GoCEl9ZRJyM+6WLMqbbeB3IqNT0RQro2VPIeO2xfKz5HU3EAmvjxE/u+pwJMTQF17ZPgrvIyZGRr0cWagsVoHWcFSYqCU0xthKjxKTSGUGaSg69lihtUyb65M4jxBsZhK2xcJBp9HrRkwC6rD+VvcMpcxQA/wxb12P9KYYE5XQKyILWeLcQCpVdclg4ETXwjDoys0ivfnp5P3F0uSHyTZsCmb6J9M0YbYNh32K5asazNIO4BfSZZ12EbmYwpneqw91EtxAq7q//4ppWCy3yksH7aajqEp7lACHF4j6/hFSPKXIARbkjcUiC3TqaBbKTth7Kpa4fV23xd3DCFzUs9DDSk9L7aQRWVra8qy65q0CL4glslF9l+Cgv+A8VpMdA4jl/3EMsRI1RFRv1EKAxXkgEQG2H/uHxIoRiy9XiHJIK8ZkuOVPXI64dk2xzDLFexsz8nLO8lfRViz7sLM0NSFqjr9emSD+LzRcjA/HGdc5nDp1yKKqWsGeaoVwKV8xDc0AZiEuHumg7vSLUaNdasyq0YB9WSxx4uoqW3tYjlBshHEznQr/GGLB+WaiUQL66R3eQ2G67Ij4qVi4iV/ty/MwuvGrOiZ8XBpC3IffGtfj7qlipE0V9Vm8OA1PNoZVy+gSI/fyfcRfR5iGan7aEKUn/OvNE1U7Sckl+y3FeiIrJbVSno0vyoLLoircmvfeJ09bH5HoxIxxg6gCrStniUKenEpjolYt6WZkBZvCVCGyQv9iPNhneYTVEKmjoUcc5uPad0oVdas21v5cpAg5ndPGmueiCzqqeZ+eZ2d7wFKJ2qVhltvRFGL2I/0oVhXgItkrd8JDYqF8OqNACzCTm7yjSI/AITT0CMXJfHOHsELfIo+G+5EVI7sVzvO+UeRTC+M/iNZbt2vwWW80RaTd1/OwNiviIqBdFfU0xB9Up2K5G2aYx89Elr3DHM9Qa+5xBE8qR3vzJRZ3tZuBTfRMeSPCdt7yq7Ssv+Hk8ZtxWj12bHRDoTwGz6rJi6zTD4XfgXXXm5SPY+wK8XL2mHhwYnF8UCzrBYKC7ri7VSRVyxePwYOFEGnlsQtD1thbhTRHm4L1EFrpuPxGite0YxCpbVd0I3ykGpGF+2o1CePlIsy7kYbmWEt09Z77XZCL23w3Vaat1XA7DaWH6sD3F3PqNGt6gEf/vn9gqegshlQbsXrkg6PmBDMj8kJPw2sdPL8bEJcwnGJZPW09OxtSC2btFK0O1GC5jzateFg9Wn+Rtn1/6hl6egmBsBiLg2LR9k1qOhTjEisFRoNTVPN33x6A8U0WxpscXj2pmJay0cxOEip14fjaWT7vPr/lG6bxCz06G7e64hGuUMBqwbDSq2xoagdiPCqkofGSbtflUGlMXzukUuhgztIqUaMC3zCdV8UmgjMKztfvr1ZwSV64Xg0pxMRsrhpq6ap5EIe9cF8sJJ/gWbESHdGFrkxLLLkkY3oawQTnKBO6d+O7u/F4XP1vibkoh9WNuy0DO3fjlciLZ8Si8mKGs/KLmRe4aO70w0pk753glReltKthI5ZPlZon964x8cxC+E+cPDLx81kLdhYjzqL2AQEmH3Ji4qakf9EgXUdUbZ9Tr1501veLVeqLRfaMWLR/SV1ThRZ3Thb3t6sCaXT13pEl4aJxdhuxaK7dU35tXCTyR91r2ScW4RTrGBaAA4pJ06dwLdspV1oqnIUXXZGzpeJu0/HHVa8qS0F9jnCbEi7+3DOlPYj1aMLwomo0hI89b//6vddGM06bOmBuHOo2Spm1zHgl78JRfj5wfOIyyHDxZGcl1kPK2Vef0nacCrGy9SdP042C+cKiFEfi2/Xg/+uaX6fcw1TU6zSW8+zBvfM0lO6m6c+Ru24P7R2Vdly052FM7aVnHqho72zWn6EOUO33vUm/3+8mZ/02s+5mgrnx5eciTbOriTOWjhvVkbXEy4k0jTiWOhr1rzspavTP9189aiD+U7ocxE7yuBFZ1cObA9+obTR5ohVEvg7k6FCBKFVpjFVPnscmyittFFlTRvvg4LrRRRvenHPGBY6Kl9KU23Yfqpm51XvqK2VKHKxwcGSrh9T/jCoHITe0XQgrQnE9P/iFRkazllohZZU772Dow/sopZ/uIoWBJFdEZeAetItVbo6oHFaCBZmcl/K29462DcAhNMo/SQfr2qHJ2l7/E6IcBkNHD2L7lCIm/xDmk4OdKmpzz6+F32ofiV1/pf2Bxn/b3/rtLuvjJ6vWeutX7XPTjcHe+Wl0Qs90d9feQ62zMs9ukpF6JXqtLN/zz47Rm/wJ0N580QiUapfDl/J5r2Ldk1YgXNn37Pf+F6LtMm0shPRYLvvWRoYkGhStyAo3z5t/AYJ1w5dTZMWn7hulu/Tc7Kk1zd0vEVpmsH/hvpi2n4Am1FjRCa1VWKOMCmai12taDYh95fTRNpH9OOzk79mOB/wwadULdcuOlhmNjOVGy68Peew3wpGKjXTQLpc/InCa84YvnNuo3cOu3AtMpBsOR+dXqyytNgTuiRXH4cXwQ/6tnH32W4sy0a3+lPSMdYEdn/+1zuJNPu/BYTRnLtxGHPdN8uFjK6ks9s5F7xluEzm9HPQXqyKlXZthWJvWOKZHm80lNA7F9LU7tj4MVXM3kR5tFQsCO7k8yYpDD1gP8RB9qL8N8DJUXXjIT8uzP65W6SZuDjy7P0Tx6ShP7H4iVKKX3cVJlnWKovM2itkv9heoq5rdRpiCtOMleAM4+BepeRrIuiFAz+ESmSSyfhb6ml1rH985MAzDMAzDMAzDMAzDMAzDMAzDMAzDMAzDMAzDMAzDMAzDMAzDMAzDMAzzQfkfYFPJFYIY5WMAAAAASUVORK5CYII="
                            width={270}
                        />
                    </CardBody>
                </Card>

            </div>
        </>
    )
}